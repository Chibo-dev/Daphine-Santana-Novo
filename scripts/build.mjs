// Build for Vercel (vercel.json → `npm run build`, output in dist/).
// The source files stay the ones you edit and preview directly; the build only:
//   1. inlines assets/site.css into each page (no render-blocking stylesheet request),
//      rewriting its relative url()s to absolute paths so they resolve from any page;
//   2. minifies assets/trace.js in place (same path, same ?v= cache-bust);
//   3. drops HTML comments outside <script>/<style>.
// Usage: node scripts/build.mjs [outDir=dist]
import { transform } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.resolve(ROOT, process.argv[2] || 'dist');
// everything is published as before, except the build's own files and local tooling
const SKIP = new Set(['.git', '.gitignore', '.claude', '.impeccable', '.vercel', '.DS_Store', 'node_modules', 'scripts',
  'package.json', 'package-lock.json', 'vercel.json', path.basename(OUT)]);
const PAGES = ['index.html', 'links/index.html', '404.html'];

fs.rmSync(OUT, { recursive: true, force: true });
for (const entry of fs.readdirSync(ROOT)) {
  if (SKIP.has(entry)) continue;
  fs.cpSync(path.join(ROOT, entry), path.join(OUT, entry), { recursive: true, filter: src => !SKIP.has(path.basename(src)) });
}

// 1. the stylesheet, minified, with url()s made absolute (inlined, they would otherwise resolve against each page)
const cssSrc = fs.readFileSync(path.join(ROOT, 'assets/site.css'), 'utf8')
  .replace(/url\((['"]?)([^'")]+)\1\)/g, (m, q, u) =>
    /^(data:|#|[a-z]+:|\/)/i.test(u) ? m : `url(${q}${new URL(u, 'https://x/assets/site.css').pathname}${q})`);
const css = (await transform(cssSrc, { loader: 'css', minify: true })).code.trim();
if (css.includes('</style')) throw new Error('site.css cannot be inlined: it contains </style');

// 2. the line engine
const js = (await transform(fs.readFileSync(path.join(ROOT, 'assets/trace.js'), 'utf8'), { loader: 'js', minify: true })).code;
fs.writeFileSync(path.join(OUT, 'assets/trace.js'), js);

// 3. the pages
const sheetLink = /<link rel="stylesheet" href="[^"]*assets\/site\.css(?:\?[^"]*)?">/;
for (const page of PAGES) {
  const file = path.join(OUT, page);
  let html = fs.readFileSync(file, 'utf8');
  if (!sheetLink.test(html)) throw new Error(`${page}: no site.css link to inline`);
  html = html.replace(sheetLink, () => `<style>${css}</style>`);
  // comments go, except inside scripts and styles
  html = html.split(/(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>)/i)
    .map((part, i) => (i % 2 ? part : part.replace(/<!--[\s\S]*?-->/g, '').replace(/\n[ \t]*\n+/g, '\n')))
    .join('');
  fs.writeFileSync(file, html);
}

const kb = f => (fs.statSync(path.join(OUT, f)).size / 1024).toFixed(1) + ' KB';
console.log(`built ${path.relative(ROOT, OUT) || OUT}: ` + PAGES.map(p => `${p} ${kb(p)}`).join(', ') + `, assets/trace.js ${kb('assets/trace.js')}`);
