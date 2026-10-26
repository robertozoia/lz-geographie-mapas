// Bundles the app into a single self-contained file: dist/index.html
// (JS, CSS and map data inlined; no network needed at runtime).
import { build } from 'esbuild';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const result = await build({
  entryPoints: ['src/main.js'],
  bundle: true,
  minify: true,
  format: 'iife',
  target: ['es2020'],
  write: false,
  outdir: 'dist/tmp',
  loader: { '.json': 'json' },
  legalComments: 'none',
  logLevel: 'warning',
});

const js = result.outputFiles.find((f) => f.path.endsWith('.js')).text;
const css = result.outputFiles.find((f) => f.path.endsWith('.css'))?.text ?? '';
const template = await readFile('src/index.html', 'utf8');

// Keep "</script>" sequences inside the bundle from closing the tag.
const safeJs = js.replace(/<\/script/gi, '<\\/script');
const html = template
  .replace('/*STYLE*/', () => css)
  .replace('/*SCRIPT*/', () => safeJs);

await mkdir('dist', { recursive: true });
await writeFile('dist/index.html', html);
const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
console.log(`✓ dist/index.html ${kb(Buffer.byteLength(html))} (js ${kb(js.length)}, css ${kb(css.length)})`);
