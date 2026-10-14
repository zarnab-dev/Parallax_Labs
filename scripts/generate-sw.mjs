// Writes public/sw.js from scripts/sw-template.js, stamping a build id so
// every deployment ships a byte-different worker (that is what makes the
// browser detect an update). Runs automatically before `next build`.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const buildId =
  process.env.SW_BUILD_ID ||
  (process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || "").slice(0, 8) ||
  Date.now().toString(36);

const template = readFileSync(path.join(root, "scripts", "sw-template.js"), "utf8");
writeFileSync(path.join(root, "public", "sw.js"), template.replace("__BUILD_ID__", buildId));
console.log(`[pwa] wrote public/sw.js (build ${buildId})`);
