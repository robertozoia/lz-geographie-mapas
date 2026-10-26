// 3D globe: a sphere with a painted map texture, vector lines for borders and
// rivers, a highlight overlay texture, atmosphere glow and a starfield.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { geoEquirectangular, geoInterpolate, geoDistance } from 'd3-geo';
import { borders, coastline, rivers, seas, itemById, quizItems } from '../data.js';
import { paintBase, paintHighlights, COLORS, BOX_COLORS } from './mapPainter.js';
import { boxOf } from '../game/srs.js';

const DEG = Math.PI / 180;
const MIN_DIST = 1.22;
const MAX_DIST = 3.8;

export function lonLatToVec([lon, lat], r = 1) {
  const l = lon * DEG, p = lat * DEG;
  return new THREE.Vector3(r * Math.cos(p) * Math.cos(l), r * Math.sin(p), -r * Math.cos(p) * Math.sin(l));
}

export function vecToLonLat(v) {
  const n = v.clone().normalize();
  return [Math.atan2(-n.z, n.x) / DEG, Math.asin(n.y) / DEG];
}

// Flatten line geometries into segment pairs on the sphere, densifying long
// segments so they follow the curvature instead of cutting through.
function segmentPositions(geometries, r) {
  const out = [];
  const push = (a, b) => {
    const va = lonLatToVec(a, r), vb = lonLatToVec(b, r);
    out.push(va.x, va.y, va.z, vb.x, vb.y, vb.z);
  };
  for (const g of geometries) {
    const lines = g.type === 'LineString' ? [g.coordinates]
      : g.type === 'MultiLineString' ? g.coordinates
      : g.type === 'Polygon' ? g.coordinates
      : g.type === 'MultiPolygon' ? g.coordinates.flat() : [];
    for (const line of lines) {
      for (let i = 1; i < line.length; i++) {
        const a = line[i - 1], b = line[i];
        const n = Math.ceil(geoDistance(a, b) / DEG);
        if (n <= 1) { push(a, b); continue; }
        const interp = geoInterpolate(a, b);
        let prev = a;
        for (let k = 1; k <= n; k++) { const p = interp(k / n); push(prev, p); prev = p; }
      }
    }
  }
  return new Float32Array(out);
}

const ATMOSPHERE_VERTEX = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`;
const ATMOSPHERE_FRAGMENT = `
  varying vec3 vNormal;
  void main() {
    float i = pow(0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
    gl_FragColor = vec4(0.35, 0.65, 1.0, 1.0) * i;
  }`;
const RIM_VERTEX = `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }`;
const RIM_FRAGMENT = `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float f = pow(1.0 - max(dot(vNormal, vView), 0.0), 3.0);
    gl_FragColor = vec4(0.55, 0.8, 1.0, f * 0.55);
  }`;

export const CONTINENT_VIEWS = {
  world: { ll: [10, 20], r: 60 },
  af: { ll: [20, 2], r: 36 },
  eu: { ll: [15, 52], r: 20 },
  as: { ll: [92, 32], r: 42 },
  na: { ll: [-95, 38], r: 38 },
  sa: { ll: [-60, -18], r: 32 },
  oc: { ll: [150, -22], r: 32 },
};

export class GlobeView {
  constructor(container, { onClick, onHover }) {
    this.container = container;
    this.onClick = onClick;
    this.onHover = onHover;
    this.style = { cat: 'country', mastery: null };

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer = renderer;
    container.appendChild(renderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(40, 1, 0.05, 200);
    this.camera.position.copy(lonLatToVec([10, 20], 3.2));
    this.scene.add(this.camera);

    this.scene.add(new THREE.AmbientLight(0xffffff, 1.6));
    const sun = new THREE.DirectionalLight(0xffffff, 1.5);
    sun.position.set(-1.5, 1.2, 1);
    this.camera.add(sun);

    // base map texture
    const W = Math.min(4096, renderer.capabilities.maxTextureSize);
    this.baseCanvas = Object.assign(document.createElement('canvas'), { width: W, height: W / 2 });
    this.baseTexture = new THREE.CanvasTexture(this.baseCanvas);
    this.baseTexture.colorSpace = THREE.SRGBColorSpace;
    this.baseTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    this.globe = new THREE.Mesh(
      new THREE.SphereGeometry(1, 160, 80),
      new THREE.MeshPhongMaterial({ map: this.baseTexture, shininess: 10, specular: 0x1a1a1a }),
    );
    this.scene.add(this.globe);

    // highlight overlay
    this.overlayCanvas = Object.assign(document.createElement('canvas'), { width: 4096, height: 2048 });
    this.overlayTexture = new THREE.CanvasTexture(this.overlayCanvas);
    this.overlayTexture.colorSpace = THREE.SRGBColorSpace;
    this.overlayTexture.anisotropy = this.baseTexture.anisotropy;
    const overlay = new THREE.Mesh(
      new THREE.SphereGeometry(1.0008, 160, 80),
      new THREE.MeshBasicMaterial({ map: this.overlayTexture, transparent: true, depthWrite: false }),
    );
    overlay.renderOrder = 1;
    this.scene.add(overlay);

    // rim light and atmosphere
    const rim = new THREE.Mesh(new THREE.SphereGeometry(1.002, 96, 48), new THREE.ShaderMaterial({
      vertexShader: RIM_VERTEX, fragmentShader: RIM_FRAGMENT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    rim.renderOrder = 3;
    this.scene.add(rim);
    const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(1.14, 96, 48), new THREE.ShaderMaterial({
      vertexShader: ATMOSPHERE_VERTEX, fragmentShader: ATMOSPHERE_FRAGMENT, side: THREE.BackSide,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    this.scene.add(atmosphere);

    this.addStars();
    this.addLines();
    this.addCapitals();

    const controls = new OrbitControls(this.camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = MIN_DIST;
    controls.maxDistance = MAX_DIST;
    controls.minPolarAngle = 0.12;
    controls.maxPolarAngle = Math.PI - 0.12;
    controls.zoomSpeed = 0.7;
    controls.autoRotateSpeed = 0.35;
    this.controls = controls;

    this.raycaster = new THREE.Raycaster();
    this.bindPointer();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    this.resize();
    this.paint();
    this.running = false;
  }

  addStars() {
    const n = 1800;
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(60 + Math.random() * 40);
      pos.set([v.x, v.y, v.z], i * 3);
      const b = 0.35 + Math.random() * 0.65;
      col.set([b, b, b * (0.9 + Math.random() * 0.1)], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    this.scene.add(new THREE.Points(g, new THREE.PointsMaterial({ size: 1.6, sizeAttenuation: false, vertexColors: true })));
  }

  lineMaterial(color, width, opacity = 1) {
    const m = new LineMaterial({ color, linewidth: width, transparent: opacity < 1, opacity, depthWrite: false });
    this.lineMaterials.push(m);
    return m;
  }

  addLines() {
    this.lineMaterials = [];
    const make = (geoms, r, color, width, opacity) => {
      const g = new LineSegmentsGeometry().setPositions(segmentPositions(geoms, r));
      const line = new LineSegments2(g, this.lineMaterial(color, width, opacity));
      line.renderOrder = 2;
      this.scene.add(line);
      return line;
    };
    make([coastline], 1.0012, 0x1c3d63, 1.1, 0.8);
    make([borders], 1.0013, 0x5a4026, 0.9, 0.6);
    this.seaLines = make(seas.map((f) => f.geometry), 1.0011, 0xffffff, 1, 0.35);
    this.riverLines = rivers.map((f) => {
      const item = itemById.get(f.properties.id);
      const line = make([f.geometry], 1.0015, new THREE.Color(COLORS.river).getHex(), [0, 2.2, 1.8, 1.5][item.t]);
      line.userData.item = item;
      return line;
    });
  }

  addCapitals() {
    const caps = quizItems.filter((i) => i.cat === 'capital');
    const pos = new Float32Array(caps.length * 3);
    caps.forEach((c, i) => { const v = lonLatToVec(c.ll, 1.003); pos.set([v.x, v.y, v.z], i * 3); });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(caps.length * 3).fill(1), 3));
    const dot = document.createElement('canvas');
    dot.width = dot.height = 64;
    const ctx = dot.getContext('2d');
    ctx.beginPath(); ctx.arc(32, 32, 26, 0, Math.PI * 2);
    ctx.fillStyle = '#fff'; ctx.fill();
    ctx.lineWidth = 9; ctx.strokeStyle = '#2b2b2b'; ctx.stroke();
    const tex = new THREE.CanvasTexture(dot);
    this.capitalPoints = new THREE.Points(g, new THREE.PointsMaterial({
      size: 9, sizeAttenuation: false, map: tex, vertexColors: true, alphaTest: 0.4, transparent: true,
    }));
    this.capitalPoints.renderOrder = 4;
    this.capitalPoints.userData.items = caps;
    this.scene.add(this.capitalPoints);
  }

  // Repaint the base texture and recolour vector layers for the current style.
  paint() {
    const { width, height } = this.baseCanvas;
    const proj = geoEquirectangular().scale(width / (2 * Math.PI)).translate([width / 2, height / 2]).precision(0.2);
    paintBase(this.baseCanvas.getContext('2d'), proj, { width, height, scale: width / 2048, ...this.style, lines: false });
    this.baseTexture.needsUpdate = true;

    const { cat, mastery } = this.style;
    this.seaLines.visible = cat === 'sea';
    for (const line of this.riverLines) {
      const color = mastery && cat === 'river' ? BOX_COLORS[boxOf(mastery, line.userData.item.id)] : COLORS.river;
      line.material.color.set(color);
      line.material.linewidth = mastery && cat === 'river' ? 3 : [0, 2.2, 1.8, 1.5][line.userData.item.t];
    }
    this.capitalPoints.visible = cat === 'capital';
    const colors = this.capitalPoints.geometry.getAttribute('color');
    this.capitalPoints.userData.items.forEach((c, i) => {
      const col = new THREE.Color(mastery ? BOX_COLORS[boxOf(mastery, c.id)] : '#ffffff');
      colors.setXYZ(i, col.r, col.g, col.b);
    });
    colors.needsUpdate = true;
  }

  setStyle(style) {
    this.style = { ...this.style, ...style };
    this.paint();
  }

  setHighlights(list) {
    const { width, height } = this.overlayCanvas;
    const ctx = this.overlayCanvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    const proj = geoEquirectangular().scale(width / (2 * Math.PI)).translate([width / 2, height / 2]).precision(0.3);
    paintHighlights(ctx, proj, list, { scale: width / 2048 });
    this.overlayTexture.needsUpdate = true;
  }

  // ------------------------------------------------------------- camera
  distanceFor(rDeg) {
    const theta = Math.min(70, Math.max(3, rDeg * 1.4 + 2)) * DEG;
    const vHalf = (this.camera.fov / 2) * DEG;
    const hHalf = Math.atan(Math.tan(vHalf) * this.camera.aspect);
    const d = 1 + theta / Math.tan(Math.min(vHalf, hHalf));
    return Math.min(MAX_DIST - 0.3, Math.max(MIN_DIST, d));
  }

  flyTo(ll, rDeg = 10, ms = 1100) {
    const lat = Math.max(-75, Math.min(75, ll[1]));
    const from = this.camera.position.clone();
    this.anim = {
      t0: performance.now(), ms,
      v0: from.clone().normalize(), v1: lonLatToVec([ll[0], lat]),
      d0: from.length(), d1: this.distanceFor(rDeg),
    };
    this.anim.bump = Math.min(0.9, this.anim.v0.angleTo(this.anim.v1) * 0.35);
    this.controls.enabled = false;
  }

  view(cont = 'world', ms = 1100) {
    const v = CONTINENT_VIEWS[cont] ?? CONTINENT_VIEWS.world;
    this.flyTo(v.ll, v.r, ms);
  }

  zoomBy(factor) {
    const d = this.camera.position.length();
    const target = Math.min(MAX_DIST, Math.max(MIN_DIST, 1 + (d - 1) * factor));
    const dir = this.camera.position.clone().normalize();
    this.anim = { t0: performance.now(), ms: 300, v0: dir, v1: dir, d0: d, d1: target, bump: 0 };
    this.controls.enabled = false;
  }

  setIdle(idle) {
    this.controls.autoRotate = idle;
  }

  // Click tolerance in degrees for `px` screen pixels at the current zoom.
  tolerance(px = 12) {
    const d = this.camera.position.length();
    const focal = (this.height / 2) / Math.tan((this.camera.fov / 2) * DEG);
    return Math.min(6, Math.max(0.12, px * (d - 1) / focal / DEG));
  }

  // Screen position of a lon/lat, and whether it faces the camera.
  project(ll) {
    const v = lonLatToVec(ll);
    const visible = v.dot(this.camera.position) > 1.02;
    const p = v.project(this.camera);
    return { x: (p.x + 1) / 2 * this.width, y: (1 - p.y) / 2 * this.height, visible };
  }

  // ------------------------------------------------------------- input
  bindPointer() {
    const el = this.renderer.domElement;
    let down = null;
    el.addEventListener('pointerdown', (e) => {
      down = { x: e.clientX, y: e.clientY, t: performance.now() };
      this.controls.autoRotate = false;
    });
    el.addEventListener('pointerup', (e) => {
      if (!down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      if (moved < 7 && performance.now() - down.t < 700) {
        const ll = this.lonLatAt(e);
        if (ll) this.onClick?.(ll[0], ll[1], this.tolerance(e.pointerType === 'mouse' ? 10 : 18));
      }
      down = null;
    });
    let pending = null;
    el.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse' || down) return;
      if (!pending) {
        requestAnimationFrame(() => {
          const ll = this.lonLatAt(pending);
          this.onHover?.(ll ? [ll[0], ll[1], this.tolerance(10)] : null);
          pending = null;
        });
      }
      pending = e;
    });
    el.addEventListener('pointerleave', () => this.onHover?.(null));
  }

  lonLatAt(e) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(ndc, this.camera);
    const hit = this.raycaster.intersectObject(this.globe, false)[0];
    return hit ? vecToLonLat(hit.point) : null;
  }

  resize() {
    const w = this.container.clientWidth, h = this.container.clientHeight;
    if (!w || !h) return;
    this.width = w;
    this.height = h;
    this.renderer.setSize(w, h, false);
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    for (const m of this.lineMaterials) m.resolution.set(w, h);
  }

  // ------------------------------------------------------------- loop
  start() {
    if (this.running) return;
    this.running = true;
    const tick = () => {
      if (!this.running) return;
      this.frame();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  stop() {
    this.running = false;
  }

  frame() {
    const a = this.anim;
    if (a) {
      const raw = Math.min(1, (performance.now() - a.t0) / a.ms);
      const t = raw < 0.5 ? 4 * raw ** 3 : 1 - (-2 * raw + 2) ** 3 / 2;
      const q = new THREE.Quaternion().setFromUnitVectors(a.v0, a.v1);
      const dir = a.v0.clone().applyQuaternion(new THREE.Quaternion().slerp(q, t));
      const d = a.d0 + (a.d1 - a.d0) * t + a.bump * Math.sin(Math.PI * t);
      this.camera.position.copy(dir.multiplyScalar(d));
      this.camera.lookAt(0, 0, 0);
      if (raw >= 1) {
        this.anim = null;
        this.controls.enabled = true;
      }
    } else {
      const d = this.camera.position.length();
      this.controls.rotateSpeed = Math.min(1, Math.max(0.06, (d - 1) / 2.4));
      this.controls.update();
    }
    this.renderer.render(this.scene, this.camera);
    this.onFrame?.();
  }
}
