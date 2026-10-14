// Bundle size budgets. Run after `next build` (npm run build && npm run budget).
//
// For every app route it sums the gzipped size of the JS the browser must
// download up front ("First Load JS", from .next/app-build-manifest.json) and
// compares it with bundle-budgets.json. It also checks that heavy code stays
// lazy: the 3D viewer chunk must not appear in ANY route's initial JS.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";

const root = process.cwd();
const nextDir = path.join(root, ".next");
if (!existsSync(path.join(nextDir, "app-build-manifest.json"))) {
  console.error("No build found. Run `npm run build` first.");
  process.exit(2);
}

const budgets = JSON.parse(readFileSync(path.join(root, "bundle-budgets.json"), "utf8"));
const manifest = JSON.parse(readFileSync(path.join(nextDir, "app-build-manifest.json"), "utf8"));

const gzCache = new Map();
const gzKb = (file) => {
  if (!gzCache.has(file)) gzCache.set(file, gzipSync(readFileSync(path.join(nextDir, file))).length / 1024);
  return gzCache.get(file);
};

// Heavy lazy chunks: find any chunk that contains the Three.js renderer.
const chunkDir = path.join(nextDir, "static", "chunks");
const walk = (dir) => readdirSync(dir).flatMap((f) => {
  const p = path.join(dir, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});
const allChunks = walk(chunkDir).filter((f) => f.endsWith(".js"));
const threeChunks = allChunks
  .filter((f) => readFileSync(f, "utf8").includes("WebGLRenderer"))
  .map((f) => path.relative(nextDir, f).replaceAll("\\", "/"));

let failed = false;
const rows = [];
for (const [route, files] of Object.entries(manifest.pages)) {
  if (!route.endsWith("/page")) continue; // skip layout/template entries; they're included in each page
  const js = files.filter((f) => f.endsWith(".js"));
  const total = js.reduce((sum, f) => sum + gzKb(f), 0);
  const name = route.replace(/\/page$/, "") || "/";
  const limit = budgets.routes[name] ?? budgets.defaultRoute;
  const leaked = threeChunks.some((c) => js.includes(c));
  const ok = total <= limit && !leaked;
  if (!ok) failed = true;
  rows.push({ route: name, kb: total, limit, ok, leaked });
}

const lazyKb = threeChunks.reduce((s, c) => s + gzKb(c), 0);
const lazyOk = lazyKb <= budgets.lazy3dChunkGzipKb && threeChunks.length > 0;
if (!lazyOk) failed = true;

console.log("Route".padEnd(34), "First Load JS (gz)".padStart(18), "Budget".padStart(9));
for (const r of rows.sort((a, b) => b.kb - a.kb)) {
  console.log(
    `${r.ok ? "✓" : "✗"} ${r.route}`.padEnd(34),
    `${r.kb.toFixed(1)} kB`.padStart(18),
    `${r.limit} kB`.padStart(9),
    r.leaked ? "  <- 3D chunk leaked into initial JS!" : ""
  );
}
console.log(
  `\n${lazyOk ? "✓" : "✗"} lazy 3D chunk (loaded only on "View in 3D"): ${lazyKb.toFixed(1)} kB gz` +
    ` (budget ${budgets.lazy3dChunkGzipKb} kB) — ${threeChunks.length ? "kept out of every route's initial JS" : "NOT FOUND"}`
);
process.exit(failed ? 1 : 0);
