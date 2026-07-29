// Generates the site/app icons from the hero photo in assets-src/.
//
//   npm run icons:build
//
// The icon is the band's hero image — the three sisters running through the
// wheat — square-cropped from `assets-src/hero-icon.png`. It replaced a
// generated "Õ" mark; the photo carries the brand better at the sizes people
// actually see (home screen, bookmarks, PWA install), at the cost of legibility
// in a 16px browser tab, where any photograph turns to mush.
//
// The source is a landscape composite, so the square crop is horizontal-centre
// and full-height. Crop here rather than editing the original: the file in
// assets-src/ stays the untouched master.
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
const RADIUS = 112; // ~22% — the squircle proportion of the design's app icon

// Rounded-square mask, applied last so the corners are transparent.
const MASK = `
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">
  <rect width="${SIZE}" height="${SIZE}" rx="${RADIUS}" ry="${RADIUS}" fill="#fff"/>
</svg>`;

const source = sharp(join(SRC, "hero-icon.png"));
const { width = 0, height = 0 } = await source.metadata();
const side = Math.min(width, height);

// Centre the crop horizontally; the composite is wider than it is tall, so the
// full height is kept and only the outer edges of the scene are trimmed.
const square = await source
  .extract({
    left: Math.round((width - side) / 2),
    top: Math.round((height - side) / 2),
    width: side,
    height: side,
  })
  .resize(SIZE, SIZE)
  .flatten({ background: "#0d1f15" }) // the source has alpha; --color-forest behind it
  .toBuffer();

// A photograph as a flat PNG runs to ~700KB, and the favicon is fetched on
// every page load. Palette quantisation takes it under ~60KB; at icon sizes the
// banding is invisible, and the alpha the rounded corners need is preserved.
const encode = (img) =>
  img.png({ palette: true, quality: 90, effort: 10, compressionLevel: 9 });

const rounded = await encode(
  sharp(square).composite([{ input: Buffer.from(MASK), blend: "dest-in" }]),
).toBuffer();

mkdirSync(join(ROOT, "public"), { recursive: true });

await Promise.all([
  encode(sharp(rounded)).toFile(join(ROOT, "src", "app", "icon.png")),
  // iOS applies its own mask, so this one stays a full square — a pre-rounded
  // icon gets rounded twice and shows dark wedges in the corners.
  encode(sharp(square).resize(180, 180)).toFile(
    join(ROOT, "src", "app", "apple-icon.png"),
  ),
  encode(sharp(rounded).resize(192, 192)).toFile(
    join(ROOT, "public", "icon-192.png"),
  ),
  encode(sharp(rounded).resize(512, 512)).toFile(
    join(ROOT, "public", "icon-512.png"),
  ),
]);

console.log(
  `icons written from a ${side}x${side} crop: src/app/icon.png, src/app/apple-icon.png, public/icon-{192,512}.png`,
);
