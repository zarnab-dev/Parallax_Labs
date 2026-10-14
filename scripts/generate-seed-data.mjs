// One-off generator script (run manually via `node scripts/generate-seed-data.mjs`).
// Produces src/data/products.json and matching local SVG placeholder images
// under public/images/products so the storefront has zero external image
// dependencies (important for offline/PWA support in a later week).
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dataDir = path.join(root, "src", "data");
const imagesDir = path.join(root, "public", "images", "products");

for (const dir of [dataDir, imagesDir]) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

const categories = {
  Footwear: { color: "#2563eb", items: ["Running Shoe", "Trail Sneaker", "Court Trainer", "Hiking Boot", "Canvas Slip-On", "Trail Runner", "Studio Shoe", "Winter Boot"] },
  Apparel: { color: "#7c3aed", items: ["Merino Hoodie", "Performance Tee", "Insulated Jacket", "Cargo Pants", "Wool Sweater", "Windbreaker", "Denim Jacket", "Thermal Base Layer"] },
  Accessories: { color: "#db2777", items: ["Leather Wallet", "Canvas Tote", "Wool Beanie", "Polarized Sunglasses", "Leather Belt", "Travel Duffel", "Crossbody Bag", "Silk Scarf"] },
  Electronics: { color: "#059669", items: ["Wireless Earbuds", "Smart Watch", "Bluetooth Speaker", "Noise-Cancel Headphones", "Fitness Tracker", "Portable Charger", "Mechanical Keyboard", "Webcam", "USB-C Hub", "Ring Light"] },
  Home: { color: "#d97706", items: ["Ceramic Mug Set", "Linen Throw Pillow", "Cast Iron Skillet", "Scented Candle", "Wool Rug", "Glass Carafe", "Bamboo Cutting Board", "Table Lamp", "Wall Clock", "Storage Basket"] },
  Outdoor: { color: "#0891b2", items: ["Camping Tent", "Insulated Cooler", "Hiking Backpack", "Sleeping Bag", "Trekking Poles", "Water Filter Bottle", "Camp Chair", "Headlamp"] },
};

const adjectives = ["Classic", "Pro", "Ultra", "Everyday", "Signature", "Lightweight", "Heritage", "Modern", "Essential", "All-Weather"];

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// Flat, single-colour-family illustrations (original artwork, drawn here as
// vector paths) so each category reads as what it is instead of a generic
// gradient. They're illustrations, not photographs — real product photography
// would replace these (see README, "Key technical decisions").
const ILLUSTRATIONS = {
  Footwear: (accent) => `
    <path d="M120 382h360a20 20 0 0 1 20 20v12a14 14 0 0 1-14 14H134a14 14 0 0 1-14-14z" fill="#f8fafc"/>
    <path d="M130 382c0-52 22-112 62-128l58 46c42 2 80-14 110-38 40 28 110 58 130 112v8z" fill="#ffffff" fill-opacity=".94"/>
    <path d="M178 346c64 12 160 8 250-14" stroke="${accent}" stroke-width="12" fill="none" stroke-linecap="round"/>
    <g stroke="#94a3b8" stroke-width="6" stroke-linecap="round"><path d="M270 292l24-15"/><path d="M296 305l24-15"/><path d="M322 305l24-15"/></g>`,
  Apparel: (accent) => `
    <path d="M260 190 185 215 140 290l50 25 35-30v135h150V285l35 30 50-25-45-75-75-25c-10 35-70 35-80 0z" fill="#ffffff" fill-opacity=".94"/>
    <path d="M260 190c10 35 70 35 80 0" stroke="${accent}" stroke-width="9" fill="none" stroke-linecap="round"/>`,
  Accessories: (accent) => `
    <path d="M240 272c0-86 120-86 120 0" stroke="#ffffff" stroke-width="15" fill="none" stroke-linecap="round"/>
    <rect x="190" y="270" width="220" height="190" rx="16" fill="#ffffff" fill-opacity=".94"/>
    <rect x="190" y="334" width="220" height="26" fill="${accent}"/>`,
  Electronics: (accent) => `
    <path d="M192 332c0-124 216-124 216 0" stroke="#ffffff" stroke-width="18" fill="none" stroke-linecap="round"/>
    <rect x="164" y="312" width="58" height="112" rx="27" fill="#ffffff" fill-opacity=".94"/>
    <rect x="378" y="312" width="58" height="112" rx="27" fill="#ffffff" fill-opacity=".94"/>
    <rect x="181" y="334" width="24" height="68" rx="12" fill="${accent}"/>
    <rect x="395" y="334" width="24" height="68" rx="12" fill="${accent}"/>`,
  Home: (accent) => `
    <path d="M210 250h180v150a40 40 0 0 1-40 40H250a40 40 0 0 1-40-40z" fill="#ffffff" fill-opacity=".94"/>
    <path d="M390 290h18a42 42 0 0 1 0 90h-18" stroke="#ffffff" stroke-width="18" fill="none"/>
    <rect x="210" y="318" width="180" height="22" fill="${accent}"/>
    <g stroke="#ffffff" stroke-opacity=".6" stroke-width="8" fill="none" stroke-linecap="round"><path d="M262 214c-12-18 12-30 0-52"/><path d="M308 214c-12-18 12-30 0-52"/><path d="M354 214c-12-18 12-30 0-52"/></g>`,
  Outdoor: (accent) => `
    <path d="M300 186 466 432H134z" fill="#ffffff" fill-opacity=".94"/>
    <path d="M300 300l62 132H238z" fill="${accent}"/>
    <path d="M106 432h388" stroke="#ffffff" stroke-opacity=".6" stroke-width="8" stroke-linecap="round"/>`,
};

const VIEW_TRANSFORMS = [
  "",
  "translate(300 300) rotate(-7) scale(1.08) translate(-300 -300)",
  "translate(300 300) rotate(6) scale(.92) translate(-300 -300)",
];

function makeSvgPlaceholder(title, color, seed, variantIndex = 0, category = "Footwear") {
  const rand = seededRandom(seed + variantIndex * 97);
  const shade = Math.floor(rand() * 40);
  const angle = variantIndex * 45;
  const draw = ILLUSTRATIONS[category] ?? ILLUSTRATIONS.Footwear;
  const safeTitle = title.replace(/&/g, "&amp;").replace(/"/g, "'");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" role="img" aria-label="${safeTitle}">
  <title>${safeTitle}</title>
  <defs>
    <linearGradient id="g${seed}-${variantIndex}" x1="0" y1="0" x2="1" y2="1" gradientTransform="rotate(${angle} 0.5 0.5)">
      <stop offset="0%" stop-color="${color}" />
      <stop offset="100%" stop-color="#111827" />
    </linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#g${seed}-${variantIndex})" />
  <circle cx="${180 + shade * 6}" cy="${170 + shade}" r="${150 + shade}" fill="rgba(255,255,255,0.07)" />
  <ellipse cx="300" cy="470" rx="190" ry="16" fill="rgba(0,0,0,0.25)" />
  <g transform="${VIEW_TRANSFORMS[variantIndex] ?? ""}">${draw("#111827")}
  </g>
</svg>`;
}

const products = [];
let counter = 1;

for (const [category, { color, items }] of Object.entries(categories)) {
  items.forEach((item, idx) => {
    const adjective = adjectives[(counter + idx) % adjectives.length];
    const title = `${adjective} ${item}`;
    const id = `p${String(counter).padStart(3, "0")}`;
    const slug = slugify(`${id}-${title}`);
    const basePrice = Math.round((20 + ((counter * 37) % 180)) * 100) / 100;
    const rating = Math.round((3 + ((counter * 13) % 20) / 10) * 10) / 10;
    const reviewCount = 5 + ((counter * 17) % 240);
    const imageFiles = [0, 1, 2].map((v) => `${slug}-${v}.svg`);
    imageFiles.forEach((file, v) => {
      const svg = makeSvgPlaceholder(title, color, counter, v, category);
      writeFileSync(path.join(imagesDir, file), svg, "utf-8");
    });

    const variantCount = 2 + (counter % 3);
    const variants = Array.from({ length: variantCount }).map((_, vIdx) => {
      const stock = (counter * 7 + vIdx * 11) % 40; // some will be 0 -> out of stock variant
      const labelPool =
        category === "Footwear"
          ? ["Size 7", "Size 8", "Size 9", "Size 10", "Size 11"]
          : category === "Apparel"
          ? ["XS", "S", "M", "L", "XL"]
          : ["Standard", "Compact", "Large"];
      return {
        id: `${id}-v${vIdx + 1}`,
        label: labelPool[vIdx % labelPool.length],
        stock,
      };
    });
    const stock = variants.reduce((sum, v) => sum + v.stock, 0);

    products.push({
      id,
      slug,
      title,
      description: `${title} designed for everyday reliability. Built with durable materials and a comfortable, considered fit — a dependable pick in our ${category.toLowerCase()} lineup.`,
      price: basePrice,
      currency: "USD",
      category,
      tags: [category.toLowerCase(), adjective.toLowerCase()],
      images: imageFiles.map((f) => `/images/products/${f}`),
      rating,
      reviewCount,
      stock,
      variants,
      isNew: counter % 9 === 0,
      isFeatured: counter % 7 === 0,
    });

    counter += 1;
  });
}

writeFileSync(
  path.join(dataDir, "products.json"),
  JSON.stringify(products, null, 2) + "\n",
  "utf-8"
);

console.log(`Generated ${products.length} products and ${products.length * 3} placeholder images.`);
