// Builds the game data from Natural Earth (raw/) and the curated catalog:
//   src/data/geo.json      TopoJSON with countries, rivers, seas, ranges, lakes
//   src/data/catalog.json  flat item list with names (en/es/de), continents, tiers
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import mapshaper from 'mapshaper';
import { topology } from 'topojson-server';
import { geoCentroid, geoBounds, geoDistance, geoArea, geoInterpolate } from 'd3-geo';
import * as catalog from '../content/catalog.mjs';

const LANGS = ['en', 'es', 'de'];
const CONTINENT = {
  Africa: 'af', Europe: 'eu', Asia: 'as', 'North America': 'na',
  'South America': 'sa', Oceania: 'oc', Antarctica: 'an',
};

const readGeo = async (name) => JSON.parse(await readFile(`raw/${name}.geojson`, 'utf8'));
const fc = (features) => ({ type: 'FeatureCollection', features });
const round = (x, d = 2) => Math.round(x * 10 ** d) / 10 ** d;
const errors = [];

// Run mapshaper on a FeatureCollection and return the resulting FeatureCollection.
async function shape(features, commands) {
  const out = await mapshaper.applyCommands(
    `-i in.json ${commands} -o out.json format=geojson gj2008`,
    { 'in.json': fc(features) },
  );
  const result = JSON.parse(out['out.json']);
  // mapshaper writes a GeometryCollection when features carry no properties
  if (result.type === 'GeometryCollection') {
    return fc(result.geometries.map((geometry) => ({ type: 'Feature', properties: {}, geometry })));
  }
  return result;
}

// Concatenate the geometries of several features into one Multi* geometry.
function combine(id, features) {
  const lines = [], polys = [];
  for (const f of features) {
    const g = f.geometry;
    if (!g) continue;
    if (g.type === 'LineString') lines.push(g.coordinates);
    else if (g.type === 'MultiLineString') lines.push(...g.coordinates);
    else if (g.type === 'Polygon') polys.push(g.coordinates);
    else if (g.type === 'MultiPolygon') polys.push(...g.coordinates);
  }
  const geometry = polys.length
    ? { type: 'MultiPolygon', coordinates: polys }
    : { type: 'MultiLineString', coordinates: lines };
  return { type: 'Feature', properties: { id }, geometry };
}

// Representative point and angular radius (degrees) of a feature, used for
// camera fly-to and for picking tolerance.
function placement(feature) {
  const [lon, lat] = geoCentroid(feature);
  const [[w, s], [e, n]] = geoBounds(feature);
  const corners = [[w, s], [w, n], [e, s], [e, n]];
  const r = Math.max(...corners.map((p) => geoDistance([lon, lat], p))) * 180 / Math.PI;
  return { ll: [round(lon), round(lat)], r: round(Math.min(r, 90), 1) };
}

// Pick a point on a line feature near its middle (centroids of curvy rivers
// can fall far off the river).
function lineAnchor(feature) {
  const g = feature.geometry;
  const coords = g.type === 'LineString' ? g.coordinates : g.coordinates.flat();
  const [lon, lat] = coords[Math.floor(coords.length / 2)];
  return [round(lon), round(lat)];
}

function checkNames(id, names) {
  for (const l of LANGS) if (!names?.[l]) errors.push(`${id}: missing ${l} name`);
}

const items = [];
const countryFeatures = [];

// ------------------------------------------------------------------ countries
{
  const cfg = catalog.countries;
  // Names, types and ranks come from the countries layer; geometry comes from
  // the map-units layer, which lets overseas parts (e.g. French Guiana) be
  // split off from their country.
  const src = await readGeo('ne_50m_admin_0_countries');
  const meta = new Map();
  const metaFrom = (p, a3, extra = {}) => ({
    quiz: false,
    n: cfg.names[a3] ?? { en: p.NAME_EN, es: p.NAME_ES, de: p.NAME_DE },
    c: cfg.continents[a3] ?? [CONTINENT[p.CONTINENT] ?? 'oc'],
    t: cfg.tiers[a3] ?? (p.LABELRANK <= 2 ? 1 : p.LABELRANK <= 4 ? 2 : 3),
    ...extra,
  });
  for (const f of src.features) {
    const p = f.properties;
    if (cfg.merge[p.ADM0_A3]) continue;
    const quiz = !cfg.exclude.includes(p.ADM0_A3) &&
      (cfg.types.includes(p.TYPE) || cfg.include.includes(p.ADM0_A3));
    meta.set(p.ADM0_A3, metaFrom(p, p.ADM0_A3, { quiz }));
  }
  const units = await readGeo('ne_50m_admin_0_map_units');
  const features = [];
  for (const f of units.features) {
    const p = f.properties;
    let a3;
    if (cfg.overseas.includes(p.GU_A3)) {
      a3 = p.GU_A3;
      meta.set(a3, metaFrom(p, a3, { t: 3, part: 'c:' + (cfg.merge[p.ADM0_A3] ?? p.ADM0_A3) }));
    } else {
      a3 = cfg.merge[p.ADM0_A3] ?? p.ADM0_A3;
      if (!meta.has(a3)) meta.set(a3, metaFrom(p, a3));
    }
    features.push({ ...f, properties: { a3 } });
  }
  const shaped = await shape(features, '-dissolve2 a3 -simplify 18% weighted keep-shapes');
  const places = await readGeo('ne_10m_populated_places');
  const capitalsByCountry = new Map();
  for (const f of places.features) {
    const p = f.properties;
    if (!/Admin-0 capital/.test(p.FEATURECLA)) continue;
    const list = capitalsByCountry.get(p.ADM0_A3) ?? [];
    list.push(f);
    capitalsByCountry.set(p.ADM0_A3, list);
  }

  for (const f of shaped.features) {
    const a3 = f.properties.a3;
    const m = meta.get(a3);
    const id = (m.quiz ? 'c:' : 'x:') + a3;
    countryFeatures.push({ ...f, properties: { id } });
    checkNames(id, m.n);
    const area = geoArea(f);
    const item = { id, cat: m.quiz ? 'country' : 'territory', n: m.n, c: m.c, t: m.t, ...placement(f), a: round(area * 1e4, 3) };
    if (m.part) item.part = m.part;
    items.push(item);
    if (!m.quiz || cfg.noCapital.includes(a3)) continue;

    const capId = 'k:' + a3;
    const manual = cfg.capitalManual[a3];
    if (manual) {
      item.cap = capId;
      items.push({ id: capId, cat: 'capital', n: manual.n, c: m.c, t: m.t, ll: manual.ll, r: 0, of: id });
      continue;
    }
    const caps = capitalsByCountry.get(cfg.capitalA3[a3] ?? a3) ?? [];
    const wanted = cfg.capitals[a3];
    const cap = (wanted && caps.find((c) => c.properties.NAME === wanted || c.properties.NAME_EN === wanted)) ||
      caps.find((c) => c.properties.FEATURECLA === 'Admin-0 capital') || caps[0];
    if (!cap) { errors.push(`${id}: no capital found`); continue; }
    if (wanted && cap.properties.NAME !== wanted && cap.properties.NAME_EN !== wanted) {
      errors.push(`${id}: preferred capital ${wanted} not found`);
    }
    const cp = cap.properties;
    const capNames = cfg.capitalNames[a3] ?? { en: cp.NAME_EN || cp.NAME, es: cp.NAME_ES || cp.NAME, de: cp.NAME_DE || cp.NAME };
    checkNames(capId, capNames);
    item.cap = capId;
    const [lon, lat] = cap.geometry.coordinates;
    items.push({ id: capId, cat: 'capital', n: capNames, c: m.c, t: m.t, ll: [round(lon), round(lat)], r: 0, of: id });
  }
}

// --------------------------------------------------------------------- rivers
const riverFeatures = [];
{
  const src = await readGeo('ne_10m_rivers_lake_centerlines');
  const inBox = (f, [w, s, e, n]) => {
    const pts = f.geometry.coordinates.flat(f.geometry.type === 'MultiLineString' ? 1 : 0);
    return pts.some(([x, y]) => x >= w && x <= e && y >= s && y <= n);
  };
  const raw = [];
  for (const r of catalog.rivers) {
    const segs = src.features.filter((f) => r.match.includes(f.properties.name) && inBox(f, r.bbox));
    if (!segs.length) { errors.push(`river ${r.id}: no geometry`); continue; }
    const f = combine('r:' + r.id, segs);
    if (r.extra) f.geometry.coordinates.push(...r.extra);
    raw.push(f);
  }
  const shaped = await shape(raw, '-simplify 25% weighted');
  for (const f of shaped.features) {
    const r = catalog.rivers.find((x) => 'r:' + x.id === f.properties.id);
    checkNames(f.properties.id, r.n);
    riverFeatures.push(f);
    items.push({ id: f.properties.id, cat: 'river', n: r.n, c: r.c, t: r.t, ...(r.s && { s: 1 }), ...placement(f), ll: lineAnchor(f) });
  }
}

// ---------------------------------------------------- seas and mountain ranges
async function polygonLayer(defs, srcName, nameField, prefix, cat, simplify) {
  const sources = { [srcName]: await readGeo(srcName), lakes: await readGeo('ne_50m_lakes') };
  const raw = [];
  for (const d of defs) {
    const src = sources[d.src ?? srcName];
    const field = d.src === 'lakes' ? 'name' : nameField;
    const parts = src.features.filter((f) => d.match.includes(f.properties[field]));
    const missing = d.match.filter((m) => !src.features.some((f) => f.properties[field] === m));
    if (missing.length) console.warn(`  ⚠ ${prefix}${d.id}: unmatched ${missing.join(', ')}`);
    if (!parts.length) { errors.push(`${cat} ${d.id}: no geometry`); continue; }
    raw.push(combine(prefix + d.id, parts));
  }
  // One mapshaper run per item: some shapes overlap (the Adriatic is part of
  // the Mediterranean) and a shared dissolve would hand overlaps to one item.
  const shaped = [];
  for (const f of raw) {
    const out = await shape([f], `-dissolve2 id -simplify ${simplify} weighted keep-shapes`);
    const g = out.features[0]?.geometry;
    if (!g) { errors.push(`${f.properties.id}: empty geometry after simplify`); continue; }
    shaped.push(out.features[0]);
  }
  for (const f of shaped) {
    const d = defs.find((x) => prefix + x.id === f.properties.id);
    checkNames(f.properties.id, d.n);
    const item = { id: f.properties.id, cat, n: d.n, c: d.c, t: d.t, ...placement(f), a: round(geoArea(f) * 1e4, 3) };
    if (d.kind) item.kind = d.kind;
    if (d.s) item.s = 1;
    items.push(item);
  }
  return shaped;
}
const seaFeatures = await polygonLayer(catalog.seas, 'ne_10m_geography_marine_polys', 'name', 's:', 'sea', '4%');
const rangeFeatures = await polygonLayer(catalog.ranges, 'ne_10m_geography_regions_polys', 'NAME', 'm:', 'range', '20%');

// ------------------------------------------------------------ ocean currents
// Hand-drawn paths, densified along great circles so drawing and picking agree.
const currentFeatures = [];
for (const d of catalog.currents) {
  const coords = [d.path[0]];
  for (let i = 1; i < d.path.length; i++) {
    const a = d.path[i - 1], b = d.path[i];
    const steps = Math.max(1, Math.ceil(geoDistance(a, b) * 180 / Math.PI / 2));
    const interp = geoInterpolate(a, b);
    for (let k = 1; k <= steps; k++) coords.push(interp(k / steps).map((x) => round(x)));
  }
  const id = 'o:' + d.id;
  const f = { type: 'Feature', properties: { id }, geometry: { type: 'LineString', coordinates: coords } };
  checkNames(id, d.n);
  currentFeatures.push(f);
  items.push({ id, cat: 'current', kind: d.kind, n: d.n, c: d.c, t: d.t, ...(d.s && { s: 1 }), ...placement(f), ll: lineAnchor(f) });
}

// ---------------------------------------------------------- lakes (draw only)
const lakes = await readGeo('ne_50m_lakes');
const lakeFeatures = (await shape(
  lakes.features.filter((f) => f.properties.scalerank <= 2).map((f) => ({ ...f, properties: {} })),
  '-simplify 30% weighted keep-shapes',
)).features;

// ------------------------------------------------------------------- output
if (errors.length) {
  console.error('\n✗ Data errors:\n  ' + errors.join('\n  '));
  process.exit(1);
}

const topo = topology({
  countries: fc(countryFeatures),
  rivers: fc(riverFeatures),
  seas: fc(seaFeatures),
  ranges: fc(rangeFeatures),
  lakes: fc(lakeFeatures),
  currents: fc(currentFeatures),
}, 1e5);

await mkdir('src/data', { recursive: true });
const geoText = JSON.stringify(topo);
const catText = JSON.stringify({ items });
await writeFile('src/data/geo.json', geoText);
await writeFile('src/data/catalog.json', catText);

const count = (cat) => items.filter((i) => i.cat === cat).length;
console.log(`\n✓ ${count('country')} countries, ${count('capital')} capitals, ${count('river')} rivers, ` +
  `${count('sea')} seas, ${count('range')} ranges, ${count('current')} currents (+${count('territory')} territories)`);
console.log(`  class lists: ${items.filter((i) => i.s && i.cat === 'river').length} rivers, ` +
  `${items.filter((i) => i.s && i.cat === 'sea').length} seas, ${items.filter((i) => i.s && i.cat === 'current').length} currents`);
console.log(`  geo.json ${(geoText.length / 1024).toFixed(0)} KB, catalog.json ${(catText.length / 1024).toFixed(0)} KB`);
