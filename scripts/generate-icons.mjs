// Generates the PWA icons (public/icons/*.png) with no dependencies: a tiny
// software rasteriser + PNG encoder. Run: node scripts/generate-icons.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";
import path from "node:path";
import { fileURLToPath } from "node:url";

const outDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "icons");
mkdirSync(outDir, { recursive: true });

// "N" monogram in unit coordinates (kept well inside the maskable safe zone).
const L = 0.29, R = 0.71, T = 0.27, B = 0.73, W = 0.12;
const inRect = (x, y, x0, y0, x1, y1) => x >= x0 && x <= x1 && y >= y0 && y <= y1;
function inN(x, y) {
  if (inRect(x, y, L, T, L + W, B) || inRect(x, y, R - W, T, R, B)) return true;
  // diagonal: parallelogram (L,T)-(L+W,T)-(R,B)-(R-W,B)
  if (y < T || y > B) return false;
  const t = (y - T) / (B - T);
  const left = L + t * (R - W - L);
  return x >= left && x <= left + W;
}
function inRounded(x, y, r) {
  const cx = Math.min(Math.max(x, r), 1 - r), cy = Math.min(Math.max(y, r), 1 - r);
  return (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
}

function render(size, { rounded }) {
  const px = new Uint8Array(size * size * 4);
  const SS = 3;
  for (let j = 0; j < size; j++) for (let i = 0; i < size; i++) {
    let r = 0, g = 0, b = 0, a = 0;
    for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++) {
      const x = (i + (sx + 0.5) / SS) / size, y = (j + (sy + 0.5) / SS) / size;
      if (rounded && !inRounded(x, y, 0.22)) continue;
      a += 255;
      if (inN(x, y)) { r += 255; g += 255; b += 255; }
      else { r += 37 + (30 - 37) * y; g += 99 + (58 - 99) * y; b += 235 + (138 - 235) * y; }
    }
    const n = SS * SS, o = (j * size + i) * 4, covered = a / 255 || 1;
    px[o] = r / covered; px[o + 1] = g / covered; px[o + 2] = b / covered; px[o + 3] = a / n;
  }
  return px;
}

const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc32 = (buf) => { let c = 0xffffffff; for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function png(size, rgba) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) { raw[y * (size * 4 + 1)] = 0; Buffer.from(rgba.buffer, y * size * 4, size * 4).copy(raw, y * (size * 4 + 1) + 1); }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
}

const targets = [
  ["icon-192.png", 192, true],
  ["icon-512.png", 512, true],
  ["icon-maskable-512.png", 512, false], // full-bleed: the OS applies its own mask
  ["apple-touch-icon.png", 180, false],  // iOS doesn't want transparency
];
for (const [name, size, rounded] of targets) {
  writeFileSync(path.join(outDir, name), png(size, render(size, { rounded })));
  console.log("wrote", name);
}
