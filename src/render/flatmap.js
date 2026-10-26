// Flat world map (Equal Earth projection) on a 2D canvas with pan and zoom.
// Same interface as GlobeView so the game can switch between them.
import { geoEqualEarth } from 'd3-geo';
import { paintBase, paintHighlights } from './mapPainter.js';
import { CONTINENT_VIEWS } from './globe.js';

const DEG = Math.PI / 180;
const MAX_K = 60;

export class FlatView {
  constructor(container, { onClick, onHover }) {
    this.container = container;
    this.onClick = onClick;
    this.onHover = onHover;
    this.style = { cat: 'country', mastery: null };
    this.highlights = [];
    this.k = 1;
    this.o = [0, 0];

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'flat-canvas';
    container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.cache = document.createElement('canvas');

    this.bindPointer();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    this.resize();
  }

  projection() {
    return geoEqualEarth().scale(this.s0 * this.k)
      .translate([this.t0[0] * this.k + this.o[0], this.t0[1] * this.k + this.o[1]]).precision(0.3);
  }

  resize() {
    const w = this.container.clientWidth, h = this.container.clientHeight;
    if (!w || !h) return;
    const first = !this.width;
    const center = !first && this.invert([this.width / 2, this.height / 2]);
    this.width = w;
    this.height = h;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    for (const c of [this.canvas, this.cache]) { c.width = w * this.dpr; c.height = h * this.dpr; }
    const base = geoEqualEarth().fitExtent([[12, 12], [w - 12, h - 12]], { type: 'Sphere' });
    this.s0 = base.scale();
    this.t0 = base.translate();
    if (center) this.centerOn(center, this.k);
    this.paint();
  }

  // lon/lat under a screen point, or null outside the map outline.
  invert(p) {
    const proj = this.projection();
    const ll = proj.invert(p);
    if (!ll || !Number.isFinite(ll[0]) || Math.abs(ll[0]) > 180 || Math.abs(ll[1]) > 90) return null;
    const back = proj(ll);
    return Math.hypot(back[0] - p[0], back[1] - p[1]) < 1 ? ll : null;
  }

  // ------------------------------------------------------------- painting
  paint() {
    if (!this.width) return;
    const t = performance.now();
    const ctx = this.cache.getContext('2d');
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    const proj = this.projection();
    const opts = { width: this.width, height: this.height, scale: 1, ...this.style, lines: true, sphere: true };
    paintBase(ctx, proj, opts);
    paintHighlights(ctx, proj, this.highlights, { scale: 1 });
    this.cacheState = { k: this.k, o: [...this.o] };
    this.paintMs = performance.now() - t;
    this.render();
  }

  // Draw the cached bitmap, transformed to the current pan/zoom.
  render() {
    const { ctx, dpr } = this;
    const c = this.cacheState;
    const r = this.k / c.k;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.setTransform(dpr * r, 0, 0, dpr * r, dpr * (this.o[0] - c.o[0] * r), dpr * (this.o[1] - c.o[1] * r));
    ctx.drawImage(this.cache, 0, 0, this.width, this.height);
    this.onFrame?.();
  }

  // During gestures blit the cache, then repaint sharply once things settle.
  changed() {
    if (this.paintMs < 14) { this.paint(); return; }
    this.render();
    clearTimeout(this.repaintTimer);
    this.repaintTimer = setTimeout(() => this.paint(), 140);
  }

  setStyle(style) {
    this.style = { ...this.style, ...style };
    this.paint();
  }

  setHighlights(list) {
    this.highlights = list;
    this.paint();
  }

  // ------------------------------------------------------------- view
  clamp() {
    this.k = Math.min(MAX_K, Math.max(1, this.k));
    const mapW = (this.width - 24) * this.k, mapH = (this.height - 24) * this.k;
    const left = 12 * this.k + this.o[0], top = 12 * this.k + this.o[1];
    const maxLeft = Math.max(this.width / 2, 12), minLeft = Math.min(this.width / 2 - mapW, 12);
    const maxTop = Math.max(this.height / 2, 12), minTop = Math.min(this.height / 2 - mapH, 12);
    this.o[0] += Math.min(maxLeft, Math.max(minLeft, left)) - left;
    this.o[1] += Math.min(maxTop, Math.max(minTop, top)) - top;
  }

  zoomAt([px, py], f) {
    const k = Math.min(MAX_K, Math.max(1, this.k * f));
    const r = k / this.k;
    this.o = [px - (px - this.o[0]) * r, py - (py - this.o[1]) * r];
    this.k = k;
    this.clamp();
    this.changed();
  }

  centerOn(ll, k) {
    const b = geoEqualEarth().scale(this.s0).translate(this.t0)(ll);
    this.k = k;
    this.o = [this.width / 2 - b[0] * k, this.height / 2 - b[1] * k];
    this.clamp();
  }

  zoomFor(rDeg) {
    const rPx = Math.max(0.3, rDeg * 1.4 + 1.5) * DEG * this.s0;
    return Math.min(MAX_K, Math.max(1, Math.min(this.width, this.height) * 0.36 / rPx));
  }

  flyTo(ll, rDeg = 10, ms = 900) {
    const from = { c: this.invert([this.width / 2, this.height / 2]) ?? ll, k: this.k };
    const to = { c: ll, k: this.zoomFor(rDeg) };
    const t0 = performance.now();
    cancelAnimationFrame(this.animFrame);
    const step = () => {
      const raw = Math.min(1, (performance.now() - t0) / ms);
      const t = raw < 0.5 ? 4 * raw ** 3 : 1 - (-2 * raw + 2) ** 3 / 2;
      const k = Math.exp(Math.log(from.k) + (Math.log(to.k) - Math.log(from.k)) * t);
      const c = [from.c[0] + (to.c[0] - from.c[0]) * t, from.c[1] + (to.c[1] - from.c[1]) * t];
      this.centerOn(c, k);
      if (raw < 1) {
        this.changed();
        this.animFrame = requestAnimationFrame(step);
      } else {
        this.paint();
      }
    };
    step();
  }

  view(cont = 'world') {
    if (cont === 'world') { this.flyTo([10, 5], 200); return; }
    const v = CONTINENT_VIEWS[cont];
    this.flyTo(v.ll, v.r);
  }

  zoomBy(factor) {
    this.zoomAt([this.width / 2, this.height / 2], 1 / factor);
  }

  setIdle() {}
  start() { this.paint(); }
  stop() {}

  tolerance(px = 12) {
    return Math.min(6, Math.max(0.05, px / (this.s0 * this.k) / DEG));
  }

  project(ll) {
    const p = this.projection()(ll);
    return p ? { x: p[0], y: p[1], visible: true } : { x: 0, y: 0, visible: false };
  }

  // ------------------------------------------------------------- input
  bindPointer() {
    const el = this.canvas;
    const pointers = new Map();
    let down = null;
    let pinch = null;
    const local = (e) => {
      const r = el.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top];
    };

    el.addEventListener('pointerdown', (e) => {
      el.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, local(e));
      down = pointers.size === 1 ? { p: local(e), t: performance.now(), moved: 0 } : null;
      pinch = null;
    });
    el.addEventListener('pointermove', (e) => {
      const p = local(e);
      if (!pointers.has(e.pointerId)) {
        if (e.pointerType === 'mouse') this.hover(p);
        return;
      }
      const prev = pointers.get(e.pointerId);
      pointers.set(e.pointerId, p);
      if (pointers.size === 1) {
        if (down) down.moved += Math.hypot(p[0] - prev[0], p[1] - prev[1]);
        this.o = [this.o[0] + p[0] - prev[0], this.o[1] + p[1] - prev[1]];
        this.clamp();
        this.changed();
      } else if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const dist = Math.hypot(a[0] - b[0], a[1] - b[1]);
        const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        if (pinch) {
          this.o = [this.o[0] + mid[0] - pinch.mid[0], this.o[1] + mid[1] - pinch.mid[1]];
          this.zoomAt(mid, dist / pinch.dist);
        }
        pinch = { dist, mid };
      }
    });
    const up = (e) => {
      if (down && down.moved < 7 && performance.now() - down.t < 700 && pointers.size === 1) {
        const ll = this.invert(local(e));
        if (ll) this.onClick?.(ll[0], ll[1], this.tolerance(e.pointerType === 'mouse' ? 10 : 18));
      }
      pointers.delete(e.pointerId);
      down = null;
      pinch = null;
    };
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', (e) => { pointers.delete(e.pointerId); down = null; pinch = null; });
    el.addEventListener('pointerleave', () => this.onHover?.(null));
    el.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.zoomAt(local(e), Math.exp(-e.deltaY * 0.0018));
    }, { passive: false });
  }

  hover(p) {
    if (this.hoverPending) { this.hoverPending = p; return; }
    this.hoverPending = p;
    requestAnimationFrame(() => {
      const ll = this.invert(this.hoverPending);
      this.hoverPending = null;
      this.onHover?.(ll ? [ll[0], ll[1], this.tolerance(10)] : null);
    });
  }
}
