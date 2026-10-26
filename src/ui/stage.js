// The map behind every screen. Owns the globe and flat views, the view toggle,
// zoom buttons and DOM markers (pulses, pins) that follow the map.
import { GlobeView, vecToLonLat } from '../render/globe.js';
import { FlatView } from '../render/flatmap.js';
import { h, $ } from './dom.js';
import { t } from '../i18n.js';

class Stage {
  init() {
    this.handlers = {};
    this.style = { cat: 'country', mastery: null };
    this.highlights = [];
    this.markers = [];
    this.focus = null;
    this.cont = 'world';
    const callbacks = {
      onClick: (lon, lat, tol) => this.handlers.click?.(lon, lat, tol),
      onHover: (hit) => this.handlers.hover?.(hit),
    };
    this.globe = new GlobeView($('#map-globe'), callbacks);
    this.globe.onFrame = () => this.updateMarkers();
    this.flatCallbacks = callbacks;
    this.mode = 'globe';
    this.globe.start();
    this.buildControls();
  }

  get active() {
    return this.mode === 'globe' ? this.globe : this.flat;
  }

  buildControls() {
    this.toggleBtn = h('button', { class: 'map-btn', onclick: () => this.toggleView() });
    const zoomIn = h('button', { class: 'map-btn', onclick: () => this.active.zoomBy(0.6) }, '+');
    const zoomOut = h('button', { class: 'map-btn', onclick: () => this.active.zoomBy(1.6) }, '−');
    $('#map-controls').replaceChildren(zoomIn, zoomOut, this.toggleBtn);
    this.zoomIn = zoomIn;
    this.zoomOut = zoomOut;
    this.refreshLabels();
  }

  refreshLabels() {
    const next = this.mode === 'globe' ? 'flat' : 'globe';
    this.toggleBtn.textContent = next === 'flat' ? '🗺️' : '🌍';
    this.toggleBtn.title = this.toggleBtn.ariaLabel = `${t('view.toggle')}: ${t('view.' + next)}`;
    this.zoomIn.title = this.zoomIn.ariaLabel = t('zoom.in');
    this.zoomOut.title = this.zoomOut.ariaLabel = t('zoom.out');
  }

  showControls(show) {
    $('#map-controls').classList.toggle('hidden', !show);
  }

  setView(mode) {
    if (mode === this.mode) return;
    // carry the current centre over to the other view
    const center = this.mode === 'globe' ? vecToLonLat(this.globe.camera.position) : this.flat?.invert([this.flat.width / 2, this.flat.height / 2]);
    this.mode = mode;
    if (mode === 'flat' && !this.flat) {
      this.flat = new FlatView($('#map-flat'), this.flatCallbacks);
      this.flat.onFrame = () => this.updateMarkers();
    }
    $('#map-globe').classList.toggle('hidden', mode !== 'globe');
    $('#map-flat').classList.toggle('hidden', mode !== 'flat');
    const view = this.active;
    if (mode === 'globe') this.globe.start(); else this.globe.stop();
    view.resize();
    view.setStyle(this.style);
    view.setHighlights(this.highlights);
    if (this.focus) view.flyTo(this.focus.ll, this.focus.r, 1);
    else if (center) view.flyTo(center, mode === 'flat' ? 60 : 50, 1);
    this.refreshLabels();
    this.onViewChange?.(mode);
  }

  toggleView() {
    this.setView(this.mode === 'globe' ? 'flat' : 'globe');
  }

  setStyle(style) {
    this.style = { ...this.style, ...style };
    this.active.setStyle(this.style);
  }

  setHighlights(list) {
    this.highlights = list;
    this.active.setHighlights(list);
  }

  flyTo(ll, r, ms) {
    this.focus = { ll, r };
    this.active.flyTo(ll, r, ms);
  }

  // Fly so that an item fills a comfortable part of the screen.
  focusItem(item) {
    const r = item.cat === 'capital' ? 6 : Math.max(item.r ?? 3, 2.5);
    this.flyTo(item.ll, r);
  }

  view(cont = 'world') {
    this.cont = cont;
    this.focus = null;
    this.active.view(cont);
  }

  setIdle(idle) {
    this.globe.setIdle(idle && this.mode === 'globe');
  }

  // markers: [{ ll, kind: 'pulse' | 'cross' }]
  setMarkers(list) {
    this.markers = list.map((m) => ({ ...m, el: h('div', { class: `marker marker-${m.kind}` }) }));
    $('#markers').replaceChildren(...this.markers.map((m) => m.el));
    this.updateMarkers();
  }

  updateMarkers() {
    if (!this.markers.length) return;
    for (const m of this.markers) {
      const p = this.active.project(m.ll);
      m.el.style.transform = `translate(${p.x}px, ${p.y}px)`;
      m.el.style.opacity = p.visible ? 1 : 0;
    }
  }

  clear() {
    this.handlers = {};
    this.setHighlights([]);
    this.setMarkers([]);
  }
}

export const stage = new Stage();
