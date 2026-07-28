// Generates the site/app icons from the wheat texture in assets-src/.
//
//   npm run icons:build
//
// The mark is the Õtekse "Õ" in cream on a wheat-textured rounded square. The
// glyph is drawn as SVG geometry rather than set in Archivo Black on purpose:
// this script must produce identical output on any machine and in CI, and the
// display font is only ever downloaded at build time by next/font, so it is not
// installed as a system font for librsvg to find.
//
// Outputs (committed):
//   src/app/icon.png        — Next App Router picks this up automatically
//   src/app/apple-icon.png  — iOS home-screen icon
//   public/icon-192.png     — PWA / manifest sizes
//   public/icon-512.png
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, "..");
const SRC = join(ROOT, "assets-src");

const SIZE = 512;
const CREAM = "#f6f2e7"; // --color-cream-bright
const RADIUS = 112; // ~22% — the squircle proportion of the design's app icon

// The Õ, drawn at 512×512. The bowl is two concentric ellipses with
// fill-rule="evenodd" so the counter is punched out; the tilde is a stroked
// S-curve above it.
const MARK = `
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 512 512">
  <g fill="${CREAM}">
    <path fill-rule="evenodd" d="
      M 256 152
      a 146 163 0 1 1 -0.1 0 z
      M 256 234
      a 60 81 0 1 0 0.1 0 z
    " />
  </g>
  <path
    d="M 178 116 C 196 72, 240 72, 258 100 C 272 122, 300 124, 318 100"
    fill="none" stroke="${CREAM}" stroke-width="31"
    stroke-linecap="round" stroke-linejoin="round" />
</svg>`;

// Rounded-square mask, applied last so the corners are transparent.
const MASK = `
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">
  <rect width="${SIZE}" height="${SIZE}" rx="${RADIUS}" ry="${RADIUS}" fill="#fff"/>
</svg>`;

// Square crop from the lower half of the strip, where the ears are densest.
const base = await sharp(join(SRC, "wheat.png"))
  .extract({ left: 200, top: 60, width: 640, height: 640 })
  .resize(SIZE, SIZE)
  .modulate({ saturation: 1.05 })
  .toBuffer();

const icon = await sharp(base)
  .composite([
    { input: Buffer.from(MARK) },
    { input: Buffer.from(MASK), blend: "dest-in" },
  ])
  .png()
  .toBuffer();

mkdirSync(join(ROOT, "public"), { recursive: true });

await Promise.all([
  sharp(icon).toFile(join(ROOT, "src", "app", "icon.png")),
  sharp(icon).resize(180, 180).toFile(join(ROOT, "src", "app", "apple-icon.png")),
  sharp(icon).resize(192, 192).toFile(join(ROOT, "public", "icon-192.png")),
  sharp(icon).resize(512, 512).toFile(join(ROOT, "public", "icon-512.png")),
]);

console.log("icons written: src/app/icon.png, src/app/apple-icon.png, public/icon-{192,512}.png");
