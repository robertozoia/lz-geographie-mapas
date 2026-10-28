// Draws map layers onto a 2D canvas through any d3 projection. Used for the
// globe texture (equirectangular) and for the flat map (Equal Earth).
import { geoPath, geoGraticule10 } from 'd3-geo';
import { countries, lakes, ranges, seas, rivers, currents, borders, coastline, colorIndex, itemById, quizItems, featureById } from '../data.js';
import { boxOf } from '../game/srs.js';

export const COLORS = {
  ocean: '#2a6aa3',
  oceanDeep: '#1d4f80',
  shallow: 'rgba(140, 200, 240, 0.22)',
  land: ['#f1e2b0', '#cde0a0', '#f5c79d', '#b6d7bf', '#e8bec6', '#d5cbea'],
  territory: '#d8d3c6',
  ice: '#f2f6fa',
  border: 'rgba(80, 58, 36, 0.55)',
  coast: 'rgba(22, 52, 86, 0.75)',
  river: '#2e8ee0',
  rangeTint: 'rgba(130, 92, 55, 0.16)',
  rangeGlyph: 'rgba(120, 84, 48, 0.6)',
  seaLine: 'rgba(255, 255, 255, 0.35)',
  graticule: 'rgba(255, 255, 255, 0.07)',
  capital: '#2b2b2b',
  warm: '#ff5a4e',
  cold: '#3b8cff',
};

export const BOX_COLORS = ['#c9c9c9', '#ef5350', '#ffa726', '#ffe14d', '#9ccc65', '#43a047'];

export const HIGHLIGHT = {
  target: { fill: 'rgba(255, 214, 10, 0.6)', stroke: '#ffd60a' },
  correct: { fill: 'rgba(46, 194, 126, 0.6)', stroke: '#1fa463' },
  wrong: { fill: 'rgba(229, 72, 77, 0.55)', stroke: '#e5484d' },
  hover: { fill: 'rgba(255, 255, 255, 0.4)', stroke: 'rgba(255, 255, 255, 0.95)' },
  answer: { fill: 'rgba(46, 194, 126, 0.6)', stroke: '#1fa463' },
};

// Small repeating "mountain" glyph used to mark ranges.
let rangePattern = null;
function getRangePattern(ctx, size) {
  if (rangePattern?.size === size) return ctx.createPattern(rangePattern.canvas, 'repeat');
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  g.fillStyle = COLORS.rangeGlyph;
  const tri = (x, y, w, h) => { g.beginPath(); g.moveTo(x - w / 2, y); g.lineTo(x, y - h); g.lineTo(x + w / 2, y); g.closePath(); g.fill(); };
  tri(size * 0.3, size * 0.45, size * 0.36, size * 0.3);
  tri(size * 0.78, size * 0.95, size * 0.32, size * 0.26);
  rangePattern = { size, canvas: c };
  return ctx.createPattern(c, 'repeat');
}

function landColor(f, opts) {
  const id = f.properties.id;
  if (id === 'x:ATA') return COLORS.ice;
  if (opts.mastery && opts.cat === 'country') {
    return id.startsWith('c:') ? BOX_COLORS[boxOf(opts.mastery, id)] : COLORS.territory;
  }
  if (opts.mastery && opts.cat === 'capital') {
    const item = itemById.get(id);
    return item?.cap ? BOX_COLORS[boxOf(opts.mastery, item.cap)] : COLORS.territory;
  }
  if (!id.startsWith('c:')) return COLORS.territory;
  return COLORS.land[colorIndex.get(id) ?? 0];
}

// Paint the base map.
// opts: { width, height, scale (line width multiplier), cat, mastery,
//         lines (draw borders/rivers/capitals), sphere (fill only the globe outline) }
export function paintBase(ctx, projection, opts) {
  const { width, height } = opts;
  const s = opts.scale ?? 1;
  const path = geoPath(projection, ctx);

  ctx.save();
  ctx.clearRect(0, 0, width, height);

  // ocean
  ctx.beginPath();
  path({ type: 'Sphere' });
  if (opts.sphere) {
    const grad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) * 0.7);
    grad.addColorStop(0, COLORS.ocean);
    grad.addColorStop(1, COLORS.oceanDeep);
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = COLORS.ocean;
  }
  ctx.fill();

  ctx.beginPath();
  path(geoGraticule10());
  ctx.strokeStyle = COLORS.graticule;
  ctx.lineWidth = 1 * s;
  ctx.stroke();

  // shallow water glow along coasts
  ctx.beginPath();
  path(coastline);
  ctx.strokeStyle = COLORS.shallow;
  ctx.lineWidth = 7 * s;
  ctx.lineJoin = 'round';
  ctx.stroke();

  // land
  for (const f of countries) {
    ctx.beginPath();
    path(f);
    ctx.fillStyle = landColor(f, opts);
    ctx.fill();
  }

  // lakes
  ctx.beginPath();
  for (const f of lakes) path(f);
  ctx.fillStyle = COLORS.ocean;
  ctx.fill();

  // mountain ranges
  for (const f of ranges) {
    ctx.beginPath();
    path(f);
    if (opts.mastery && opts.cat === 'range') {
      ctx.fillStyle = BOX_COLORS[boxOf(opts.mastery, f.properties.id)];
      ctx.globalAlpha = 0.85;
      ctx.fill();
      ctx.globalAlpha = 1;
    } else {
      ctx.fillStyle = COLORS.rangeTint;
      ctx.fill();
    }
    ctx.fillStyle = getRangePattern(ctx, Math.round(18 * s));
    ctx.fill();
  }

  // seas: coloured in the mastery map, outlined while playing seas
  if (opts.cat === 'sea') {
    for (const f of seas) {
      ctx.beginPath();
      path(f);
      if (opts.mastery) {
        ctx.fillStyle = BOX_COLORS[boxOf(opts.mastery, f.properties.id)];
        ctx.globalAlpha = 0.45;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      if (opts.lines) {
        ctx.setLineDash([4 * s, 4 * s]);
        ctx.strokeStyle = COLORS.seaLine;
        ctx.lineWidth = 1 * s;
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }

  // ocean currents: red (warm) and blue (cold) arrows; painted here rather
  // than in paintLines so they are part of the globe texture too
  if (opts.cat === 'current') {
    for (const f of currents) {
      const item = itemById.get(f.properties.id);
      const color = opts.mastery ? BOX_COLORS[boxOf(opts.mastery, item.id)] : COLORS[item.kind];
      paintArrow(ctx, path, f, color, 3.2 * s, opts.width);
    }
  }

  if (opts.lines) paintLines(ctx, path, opts);
  ctx.restore();
}

// Stroke a line feature with arrowheads along it and at its end. `wrapWidth`
// skips arrowheads where the projected line jumps across the map edge.
function paintArrow(ctx, path, f, color, width, wrapWidth) {
  ctx.beginPath();
  path(f);
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.lineWidth = width + 2.5 * (width / 3.2);
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();

  const proj = path.projection();
  const pts = f.geometry.coordinates.map((c) => proj(c)).filter(Boolean);
  const head = (i) => {
    const [x1, y1] = pts[Math.max(0, i - 2)], [x2, y2] = pts[i];
    if (Math.hypot(x2 - x1, y2 - y1) > wrapWidth / 3 || (x1 === x2 && y1 === y2)) return;
    const a = Math.atan2(y2 - y1, x2 - x1), L = width * 3.4;
    ctx.beginPath();
    ctx.moveTo(x2 + Math.cos(a) * L * 0.35, y2 + Math.sin(a) * L * 0.35);
    ctx.lineTo(x2 - Math.cos(a - 0.5) * L, y2 - Math.sin(a - 0.5) * L);
    ctx.lineTo(x2 - Math.cos(a + 0.5) * L, y2 - Math.sin(a + 0.5) * L);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 1.2 * (width / 3.2);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.stroke();
  };
  // one arrowhead roughly every 15 waypoints (~30°), plus the end
  for (let i = 15; i < pts.length - 6; i += 15) head(i);
  head(pts.length - 1);
}

// Borders, coastline, rivers and capital dots (drawn as vector lines on the
// globe instead, so they stay sharp when zoomed in).
export function paintLines(ctx, path, opts) {
  const s = opts.scale ?? 1;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  ctx.beginPath();
  path(borders);
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 0.8 * s;
  ctx.stroke();

  ctx.beginPath();
  path(coastline);
  ctx.strokeStyle = COLORS.coast;
  ctx.lineWidth = 0.9 * s;
  ctx.stroke();

  for (const f of rivers) {
    const item = itemById.get(f.properties.id);
    ctx.beginPath();
    path(f);
    ctx.strokeStyle = opts.mastery && opts.cat === 'river' ? BOX_COLORS[boxOf(opts.mastery, item.id)] : COLORS.river;
    ctx.lineWidth = (opts.mastery && opts.cat === 'river' ? 3 : [0, 2, 1.6, 1.3][item.t]) * s;
    ctx.stroke();
  }

  if (opts.cat === 'capital') {
    for (const item of quizItems) {
      if (item.cat !== 'capital') continue;
      const p = path.projection()(item.ll);
      if (!p) continue;
      ctx.beginPath();
      ctx.arc(p[0], p[1], 2.6 * s, 0, Math.PI * 2);
      ctx.fillStyle = opts.mastery ? BOX_COLORS[boxOf(opts.mastery, item.id)] : '#fff';
      ctx.fill();
      ctx.lineWidth = 1.2 * s;
      ctx.strokeStyle = COLORS.capital;
      ctx.stroke();
    }
  }
}

// Paint highlighted items. `list` is [{ item, style }] with a HIGHLIGHT key.
export function paintHighlights(ctx, projection, list, { scale = 1 } = {}) {
  const path = geoPath(projection, ctx);
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  for (const { item, style } of list) {
    const c = HIGHLIGHT[style];
    if (item.cat === 'capital') {
      const p = projection(item.ll);
      if (!p) continue;
      ctx.beginPath();
      ctx.arc(p[0], p[1], 5 * scale, 0, Math.PI * 2);
      ctx.fillStyle = c.stroke;
      ctx.fill();
      ctx.lineWidth = 2 * scale;
      ctx.strokeStyle = '#fff';
      ctx.stroke();
      continue;
    }
    const feature = featureById.get(item.id);
    if (!feature) continue;
    ctx.beginPath();
    path(feature);
    if (item.cat === 'river' || item.cat === 'current') {
      ctx.strokeStyle = c.fill;
      ctx.lineWidth = 9 * scale;
      ctx.stroke();
      ctx.strokeStyle = c.stroke;
      ctx.lineWidth = 3.5 * scale;
      ctx.stroke();
    } else {
      ctx.fillStyle = c.fill;
      ctx.fill();
      ctx.strokeStyle = c.stroke;
      ctx.lineWidth = 2.5 * scale;
      ctx.stroke();
    }
  }
  ctx.restore();
}
