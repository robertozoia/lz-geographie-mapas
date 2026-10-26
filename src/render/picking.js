// Turns a map position (lon/lat) into the items under it. Pure functions,
// no DOM, so they can be unit tested.
import { geoContains, geoDistance } from 'd3-geo';
import { items, featureById } from '../data.js';

const DEG = Math.PI / 180;
export const EARTH_KM = 6371;

function inBounds(f, lon, lat, tol) {
  const [[w, s], [e, n]] = f.bounds;
  if (lat < s - tol || lat > n + tol) return false;
  if (w <= e) return lon >= w - tol && lon <= e + tol;
  return lon >= w - tol || lon <= e + tol; // crosses the antimeridian
}

// Shortest distance (degrees of arc, approximate) from a point to a line feature.
export function distanceToLine(f, lon, lat) {
  const g = f.geometry;
  const lines = g.type === 'LineString' ? [g.coordinates] : g.coordinates;
  const k = Math.cos(lat * DEG);
  let best = Infinity;
  for (const line of lines) {
    for (let i = 1; i < line.length; i++) {
      const [x1, y1] = line[i - 1];
      const [x2, y2] = line[i];
      // local equirectangular frame centred on the point
      const ax = wrap(x1 - lon) * k, ay = y1 - lat;
      const bx = wrap(x2 - lon) * k, by = y2 - lat;
      const dx = bx - ax, dy = by - ay;
      const len2 = dx * dx + dy * dy;
      const u = len2 ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / len2)) : 0;
      const px = ax + u * dx, py = ay + u * dy;
      best = Math.min(best, Math.hypot(px, py));
    }
  }
  return best;
}

const wrap = (d) => (d > 180 ? d - 360 : d < -180 ? d + 360 : d);

// Distance in km from a point to an item's shape (0 when inside a polygon).
export function distanceKm(item, lon, lat) {
  if (item.cat === 'capital') return geoDistance([lon, lat], item.ll) * EARTH_KM;
  const f = featureById.get(item.id);
  if (item.cat === 'river') return distanceToLine(f, lon, lat) * DEG * EARTH_KM;
  if (geoContains(f, [lon, lat])) return 0;
  return nearestVertex(f, lon, lat) * EARTH_KM;
}

function nearestVertex(f, lon, lat) {
  const g = f.geometry;
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  let best = Infinity;
  for (const poly of polys) {
    for (const ring of poly) {
      const step = Math.max(1, Math.floor(ring.length / 400));
      for (let i = 0; i < ring.length; i += step) best = Math.min(best, geoDistance([lon, lat], ring[i]));
    }
  }
  return best;
}

// Items of the given categories under (lon, lat). `tol` is the click
// tolerance in degrees (depends on zoom). Results are ordered from most to
// least specific: points, lines, then polygons by increasing area.
export function pick(lon, lat, tol, cats) {
  const hits = [];
  for (const item of items) {
    if (!cats.includes(item.cat === 'territory' ? 'country' : item.cat)) continue;
    if (item.cat === 'capital') {
      const d = geoDistance([lon, lat], item.ll) / DEG;
      if (d <= tol * 1.5) hits.push({ item, rank: 0, d });
      continue;
    }
    const f = featureById.get(item.id);
    if (!f || !inBounds(f, lon, lat, tol)) continue;
    if (item.cat === 'river') {
      const d = distanceToLine(f, lon, lat);
      if (d <= tol) hits.push({ item, rank: 1, d });
    } else if (geoContains(f, [lon, lat])) {
      hits.push({ item, rank: 2, d: item.a ?? 0 });
    } else if (item.cat === 'country' && item.r < 2) {
      // tiny countries and islands get a generous circle around them
      const d = geoDistance([lon, lat], item.ll) / DEG;
      if (d <= Math.max(tol * 1.2, item.r)) hits.push({ item, rank: 1.5, d });
    }
  }
  return hits.sort((a, b) => a.rank - b.rank || a.d - b.d).map((h) => h.item);
}
