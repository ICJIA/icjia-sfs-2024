/**
 * Generates the 1200×630 social-share card at public/og-image.png (and
 * dist/og-image.png when a build is present).
 *
 * Pure SVG → PNG via Sharp, whose bundled libvips ships librsvg. Per the
 * v6.4 conversion checklist §8 "librsvg font-fallback gotcha": SVG <text>
 * MUST use a GENERIC family ("sans-serif"/"serif") — librsvg cannot see
 * the Fontsource woff2s in node_modules and silently renders .notdef
 * boxes for any *named* webfont. So this card is set in the system sans on
 * purpose; the brand is carried by color, weight, spacing and layout, not
 * by a specific typeface. (Want true Roboto? That needs a headless-browser
 * render step instead of librsvg — a deliberately larger dependency.)
 *
 * Run:  pnpm og-image      (alias for: node scripts/build-og-image.mjs)
 */
import sharp from "sharp";
import { writeFile, mkdir, access } from "node:fs/promises";
import path from "node:path";

const W = 1200;
const H = 630;

// --- Copy ------------------------------------------------------------------
const EYEBROW = "ILLINOIS CRIMINAL JUSTICE INFORMATION AUTHORITY";
const TITLE = "Safe From the Start";
// SVG <text> does not wrap; the description is hand-broken into lines that
// read comfortably at thumbnail size (lightly-condensed core description).
const DESC = [
  "Developmentally and culturally appropriate direct",
  "services to children ages 0–5 exposed to violence,",
  "and their families.",
];
const SITE_URL = "sfs.icjia.illinois.gov";

// --- Palette (brand tokens from src/styles/global.css) ---------------------
const NAVY = "#0d3a66"; // slightly deeper than --color-sfs-navy for gradient top
const BLUE = "#1263a5"; // --color-sfs-blue
const ACCENT = "#7fb3e3"; // lightened brand blue — the only "pop"
const EYEBROW_FILL = "#9ec3e6";
const DESC_FILL = "#e6f0fb";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${NAVY}"/>
      <stop offset="0.55" stop-color="#0f4a82"/>
      <stop offset="1" stop-color="${BLUE}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.2" cy="0.16" r="0.85">
      <stop offset="0" stop-color="#2a7bc0" stop-opacity="0.5"/>
      <stop offset="0.6" stop-color="#2a7bc0" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <!-- Faint concentric rings, top-right, for subtle depth. -->
  <g fill="none" stroke="#ffffff" stroke-opacity="0.05">
    <circle cx="1150" cy="70" r="300" stroke-width="2"/>
    <circle cx="1150" cy="70" r="210" stroke-width="2"/>
    <circle cx="1150" cy="70" r="120" stroke-width="2"/>
  </g>

  <!-- Vertical accent bar beside the headline. -->
  <rect x="60" y="120" width="8" height="150" rx="4" fill="${ACCENT}"/>

  <g font-family="sans-serif">
    <!-- Eyebrow / agency -->
    <text x="92" y="150" font-size="21" font-weight="bold" fill="${EYEBROW_FILL}"
          style="letter-spacing:3px">${EYEBROW}</text>

    <!-- Title -->
    <text x="90" y="252" font-size="78" font-weight="bold" fill="#ffffff">${TITLE}</text>

    <!-- Short rule between title and description -->
    <rect x="92" y="300" width="70" height="5" rx="2.5" fill="${ACCENT}"/>

    <!-- Description (hand-wrapped) -->
    <text x="92" y="372" font-size="33" fill="${DESC_FILL}">
      <tspan x="92" dy="0">${DESC[0]}</tspan>
      <tspan x="92" dy="46">${DESC[1]}</tspan>
      <tspan x="92" dy="46">${DESC[2]}</tspan>
    </text>

    <!-- Footer: URL (left) -->
    <text x="92" y="566" font-size="25" font-weight="bold" fill="${EYEBROW_FILL}"
          style="letter-spacing:0.5px">${SITE_URL}</text>
  </g>
</svg>`;

const png = await sharp(Buffer.from(svg, "utf8"))
  .png({ compressionLevel: 9 })
  .toBuffer();

// public/ is the source of truth (served in dev + copied into dist by the
// astro build). Also write dist/ when it already exists so a post-build run
// matches production byte-for-byte without a second `astro build`.
const targets = [path.resolve("public/og-image.png")];
try {
  await access(path.resolve("dist"));
  targets.push(path.resolve("dist/og-image.png"));
} catch {
  /* no dist yet — fine */
}

for (const t of targets) {
  await mkdir(path.dirname(t), { recursive: true });
  await writeFile(t, png);
  console.log(`wrote ${t} (${(png.length / 1024).toFixed(1)} KB, ${W}×${H})`);
}
