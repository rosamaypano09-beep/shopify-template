// Generates the illustrated pack shots used by the demo catalog.
// Run: node scripts/generate-demo-art.mjs
// Real clients use product photos from Shopify; this only exists so the demo
// store has consistent imagery without shipping stock photos.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "demo");

const INK = "#17251C";
const CREAM = "#F6F7F1";

const glyphs = {
  bone: (c) =>
    `<g fill="${c}"><rect x="-46" y="-13" width="92" height="26" rx="6"/><circle cx="-50" cy="-15" r="19"/><circle cx="-50" cy="15" r="19"/><circle cx="50" cy="-15" r="19"/><circle cx="50" cy="15" r="19"/></g>`,
  drop: (c) => `<path fill="${c}" d="M0-62C28-24 44-2 44 20a44 44 0 0 1-88 0C-44-2-28-24 0-62Z"/>`,
  leaf: (c) =>
    `<g><path fill="${c}" d="M-52 48C-60-22-8-58 56-54 60 10 24 62-52 48Z"/><path d="M-44 42 30-30" stroke="${CREAM}" stroke-width="7" stroke-linecap="round" fill="none"/></g>`,
  moon: (c) => `<path fill="${c}" d="M22-58a60 60 0 1 0 36 96A50 50 0 0 1 22-58Z"/>`,
  paw: (c) =>
    `<g fill="${c}"><ellipse cx="0" cy="24" rx="34" ry="28"/><ellipse cx="-42" cy="-10" rx="14" ry="18"/><ellipse cx="-15" cy="-36" rx="14" ry="19"/><ellipse cx="15" cy="-36" rx="14" ry="19"/><ellipse cx="42" cy="-10" rx="14" ry="18"/></g>`,
  sun: (c) =>
    `<g fill="${c}"><circle r="30"/>${Array.from({ length: 8 }, (_, i) => `<rect x="-6" y="-62" width="12" height="22" rx="6" transform="rotate(${i * 45})"/>`).join("")}</g>`,
};

const esc = (s) => s.replace(/&/g, "&amp;");

function label(x, y, w, h, product) {
  const lines = product.label;
  const text = lines
    .map(
      (line, i) =>
        `<text x="${x + w / 2}" y="${y + h * 0.66 + i * 40}" text-anchor="middle" font-family="Verdana, Geneva, sans-serif" font-weight="700" font-size="32" fill="${INK}">${esc(line)}</text>`,
    )
    .join("");
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="${CREAM}"/>
  <g transform="translate(${x + w / 2} ${y + h * 0.3}) scale(0.82)">${glyphs[product.glyph](product.color)}</g>
  ${text}
  <text x="${x + w / 2}" y="${y + h - 22}" text-anchor="middle" font-family="Verdana, Geneva, sans-serif" font-size="19" fill="${INK}" opacity="0.7">${esc(product.size)}</text>`;
}

function jar(product) {
  return `<rect x="262" y="150" width="276" height="74" rx="20" fill="${INK}"/>
  <rect x="222" y="212" width="356" height="452" rx="46" fill="${product.color}"/>
  <rect x="222" y="212" width="50" height="452" rx="25" fill="#fff" opacity="0.14"/>
  ${label(262, 300, 276, 300, product)}`;
}

function bottle(product) {
  return `<rect x="352" y="96" width="96" height="74" rx="14" fill="${INK}"/>
  <rect x="368" y="160" width="64" height="60" fill="${product.color}"/>
  <path d="M368 210h64c56 22 86 62 86 120v300a40 40 0 0 1-40 40H322a40 40 0 0 1-40-40V330c0-58 30-98 86-120Z" fill="${product.color}"/>
  <rect x="282" y="330" width="42" height="340" rx="21" fill="#fff" opacity="0.14"/>
  ${label(302, 356, 196, 270, { ...product, label: product.label.map((l) => l) })}`;
}

function pouch(product) {
  return `<path d="M236 190h328l34 446a40 40 0 0 1-40 44H242a40 40 0 0 1-40-44Z" fill="${product.color}"/>
  <rect x="236" y="168" width="328" height="46" rx="10" fill="${INK}"/>
  <path d="M236 190h50l-30 490h-14a40 40 0 0 1-40-44Z" fill="#fff" opacity="0.14"/>
  ${label(272, 300, 256, 290, product)}`;
}

const shapes = { jar, bottle, pouch };

function packshot(product) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800" role="img" aria-label="${esc(product.title)}">
  <rect width="800" height="800" fill="${product.bg}"/>
  <ellipse cx="400" cy="690" rx="230" ry="26" fill="${INK}" opacity="0.12"/>
  ${shapes[product.shape](product)}
</svg>
`;
}

function collectionTile(c) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000" role="img" aria-label="${esc(c.title)}">
  <rect width="800" height="1000" fill="${c.bg}"/>
  <circle cx="400" cy="430" r="250" fill="${c.disc}"/>
  <g transform="translate(400 430) scale(2.9)">${glyphs[c.glyph](c.color)}</g>
</svg>
`;
}

const products = [
  { handle: "everyday-multivitamin-chews", title: "Everyday Multivitamin Chews", label: ["Everyday", "Multi"], size: "60 soft chews", glyph: "sun", color: "#E0A91B", bg: "#FBEFC4", shape: "jar" },
  { handle: "hip-joint-chews", title: "Hip and Joint Chews", label: ["Hip +", "Joint"], size: "60 soft chews", glyph: "bone", color: "#1E4D3A", bg: "#DCE8D2", shape: "jar" },
  { handle: "wild-salmon-oil", title: "Wild Salmon Oil", label: ["Salmon", "Oil"], size: "250 ml", glyph: "drop", color: "#E8836F", bg: "#FADCD5", shape: "bottle" },
  { handle: "gut-probiotic-powder", title: "Gut Probiotic Powder", label: ["Gut", "Probiotic"], size: "120 g powder", glyph: "leaf", color: "#5E8C3F", bg: "#E3EDCF", shape: "pouch" },
  { handle: "settle-calming-chews", title: "Settle Calming Chews", label: ["Settle", "Calm"], size: "60 soft chews", glyph: "moon", color: "#4B5FA8", bg: "#DCE1F3", shape: "jar" },
  { handle: "puppy-starter-chews", title: "Puppy Starter Chews", label: ["Puppy", "Starter"], size: "45 soft chews", glyph: "paw", color: "#D9608A", bg: "#F8DAE4", shape: "jar" },
  { handle: "senior-vitality-chews", title: "Senior Vitality Chews", label: ["Senior", "Vitality"], size: "60 soft chews", glyph: "sun", color: "#7A4E9C", bg: "#E7DCF0", shape: "jar" },
  { handle: "skin-coat-chews", title: "Skin and Coat Chews", label: ["Skin +", "Coat"], size: "60 soft chews", glyph: "drop", color: "#C7702B", bg: "#F6E2CC", shape: "jar" },
  { handle: "pumpkin-fibre-topper", title: "Pumpkin Fibre Topper", label: ["Pumpkin", "Fibre"], size: "150 g powder", glyph: "leaf", color: "#D9822B", bg: "#FAE6CF", shape: "pouch" },
];

const collections = [
  { handle: "joints-mobility", title: "Joints and mobility", glyph: "bone", color: "#F6F7F1", disc: "#1E4D3A", bg: "#DCE8D2" },
  { handle: "skin-coat", title: "Skin and coat", glyph: "drop", color: "#F6F7F1", disc: "#E8836F", bg: "#FADCD5" },
  { handle: "digestion", title: "Digestion", glyph: "leaf", color: "#17251C", disc: "#F2C230", bg: "#FBEFC4" },
  { handle: "calm", title: "Calm", glyph: "moon", color: "#F6F7F1", disc: "#4B5FA8", bg: "#DCE1F3" },
  { handle: "puppy", title: "Puppies", glyph: "paw", color: "#F6F7F1", disc: "#D9608A", bg: "#F8DAE4" },
  { handle: "senior", title: "Seniors", glyph: "sun", color: "#F6F7F1", disc: "#7A4E9C", bg: "#E7DCF0" },
  { handle: "best-sellers", title: "Best sellers", glyph: "paw", color: "#17251C", disc: "#F2C230", bg: "#E8EDDA" },
];

function hero() {
  const pick = (h) => products.find((p) => p.handle === h);
  const place = (product, x, y, s) =>
    `<g transform="translate(${x} ${y}) scale(${s})">${shapes[product.shape](product)}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1100" width="1200" height="1100" role="img" aria-label="Three supplement jars beside a yellow ball">
  <rect width="1200" height="1100" fill="#1E4D3A"/>
  <circle cx="930" cy="250" r="330" fill="#285F49"/>
  <rect y="880" width="1200" height="220" fill="#17251C" opacity="0.28"/>
  ${place(pick("gut-probiotic-powder"), -70, 270, 0.92)}
  ${place(pick("wild-salmon-oil"), 520, 190, 1.0)}
  ${place(pick("everyday-multivitamin-chews"), 190, 150, 1.14)}
  <circle cx="1010" cy="860" r="92" fill="#F2C230"/>
  <path d="M938 806c44 24 70 62 74 144" stroke="#F6F7F1" stroke-width="9" fill="none" stroke-linecap="round"/>
  <path d="M1084 812c-42 30-58 70-52 138" stroke="#F6F7F1" stroke-width="9" fill="none" stroke-linecap="round"/>
</svg>
`;
}

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#1E4D3A"/><g transform="translate(32 33) scale(0.34)">${glyphs.paw("#F2C230")}</g></svg>
`;

mkdirSync(join(root, "products"), { recursive: true });
mkdirSync(join(root, "collections"), { recursive: true });
mkdirSync(join(root, "..", "brand"), { recursive: true });
for (const p of products) writeFileSync(join(root, "products", `${p.handle}.svg`), packshot(p));
for (const c of collections) writeFileSync(join(root, "collections", `${c.handle}.svg`), collectionTile(c));
writeFileSync(join(root, "hero.svg"), hero());
writeFileSync(join(root, "..", "brand", "favicon.svg"), favicon);
console.log(`Wrote ${products.length} pack shots, ${collections.length} collection tiles, hero and favicon.`);
