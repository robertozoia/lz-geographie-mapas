// Decodes the bundled TopoJSON and catalog into features and items.
import { feature, mesh, neighbors } from 'topojson-client';
import { geoBounds } from 'd3-geo';
import topo from './data/geo.json';
import catalog from './data/catalog.json';

export const CATS = ['country', 'capital', 'river', 'sea', 'range', 'current'];
export const CONTINENTS = ['af', 'eu', 'as', 'na', 'sa', 'oc'];

export const items = catalog.items;
export const itemById = new Map(items.map((i) => [i.id, i]));
export const quizItems = items.filter((i) => i.cat !== 'territory');

const layer = (name) => feature(topo, topo.objects[name]).features;

export const countries = layer('countries');
export const rivers = layer('rivers');
export const seas = layer('seas');
export const ranges = layer('ranges');
export const lakes = layer('lakes');
export const currents = layer('currents');

export const borders = mesh(topo, topo.objects.countries, (a, b) => a !== b);
export const coastline = mesh(topo, topo.objects.countries, (a, b) => a === b);

// Geometry for each item id (capitals are points from the catalog).
export const featureById = new Map();
for (const f of [...countries, ...rivers, ...seas, ...ranges, ...currents]) {
  f.id = f.properties.id;
  f.bounds = geoBounds(f);
  featureById.set(f.id, f);
}

export function featureFor(item) {
  if (item.cat === 'capital') {
    return { type: 'Feature', id: item.id, properties: { id: item.id }, geometry: { type: 'Point', coordinates: item.ll } };
  }
  return featureById.get(item.id);
}

// Map-coloring index (0–5) per country so that neighbors differ.
export const colorIndex = new Map();
{
  const geoms = topo.objects.countries.geometries;
  const adj = neighbors(geoms);
  const order = geoms.map((_, i) => i).sort((a, b) => adj[b].length - adj[a].length);
  const assigned = new Array(geoms.length).fill(-1);
  for (const i of order) {
    const used = new Set(adj[i].map((j) => assigned[j]));
    let c = 0;
    while (used.has(c)) c++;
    assigned[i] = c % 6;
  }
  geoms.forEach((g, i) => colorIndex.set(g.properties.id, assigned[i]));
}

// Items of one category, optionally restricted to a continent and to the
// class list (the school worksheets).
export function pool(cat, cont = 'world', maxTier = 3, list = 'all') {
  return quizItems.filter((i) => i.cat === cat && i.t <= maxTier && (cont === 'world' || i.c.includes(cont)) &&
    (list !== 'school' || i.s));
}

// Whether a category has a class list to choose from.
export const hasClassList = (cat) => quizItems.some((i) => i.cat === cat && i.s);
