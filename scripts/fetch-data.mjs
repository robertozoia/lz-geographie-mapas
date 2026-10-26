// Downloads the Natural Earth layers used by the game into raw/ (public domain data).
import { mkdir, writeFile, access } from 'node:fs/promises';
import path from 'node:path';

const BASE = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/';
const LAYERS = [
  'ne_50m_admin_0_countries',
  'ne_10m_populated_places',
  'ne_10m_rivers_lake_centerlines',
  'ne_50m_lakes',
  'ne_10m_geography_marine_polys',
  'ne_10m_geography_regions_polys',
];

const outDir = path.resolve('raw');
await mkdir(outDir, { recursive: true });
const force = process.argv.includes('--force');

for (const name of LAYERS) {
  const file = path.join(outDir, `${name}.geojson`);
  if (!force) {
    try { await access(file); console.log(`✓ ${name} (cached)`); continue; } catch {}
  }
  process.stdout.write(`↓ ${name} … `);
  const res = await fetch(`${BASE}${name}.geojson`);
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  const text = await res.text();
  await writeFile(file, text);
  console.log(`${(text.length / 1e6).toFixed(1)} MB`);
}
