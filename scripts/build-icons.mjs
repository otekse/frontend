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
//                             (192px: browsers fetch it on every page load,
//                             and at 512 the photo cost 156KB of that)
//   src/app/apple-icon.png  — iOS home-screen icon
//   public/icon-192.png     — PWA / manifest sizes
//   public/icon-512.png
//   src/app/favicon.ico     — 16/32/48px, for everything that asks for
//                             /favicon.ico by name instead of reading <link>
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";
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
  encode(sharp(rounded).resize(192, 192)).toFile(
    join(ROOT, "src", "app", "icon.png"),
  ),
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

// Browsers, feed readers and some crawlers request /favicon.ico whatever the
// page's <link> tags say; without the file each of those is a 404. An ICO can
// hold PNG frames as they are, so this is just a directory header in front of
// three plain RGBA PNGs — no BMP encoding needed.
const ICO_SIZES = [16, 32, 48];
const frames = await Promise.all(
  ICO_SIZES.map((s) => sharp(rounded).resize(s, s).png().toBuffer()),
);
const header = Buffer.alloc(6);
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(frames.length, 4);
const directory = Buffer.alloc(16 * frames.length);
let offset = header.length + directory.length;
frames.forEach((frame, i) => {
  const at = 16 * i;
  directory.writeUInt8(ICO_SIZES[i], at); // width
  directory.writeUInt8(ICO_SIZES[i], at + 1); // height
  directory.writeUInt16LE(1, at + 4); // colour planes
  directory.writeUInt16LE(32, at + 6); // bits per pixel
  directory.writeUInt32LE(frame.length, at + 8);
  directory.writeUInt32LE(offset, at + 12);
  offset += frame.length;
});
writeFileSync(
  join(ROOT, "src", "app", "favicon.ico"),
  Buffer.concat([header, directory, ...frames]),
);

console.log(
  `icons written from a ${side}x${side} crop: src/app/icon.png, src/app/apple-icon.png, public/icon-{192,512}.png`,
);
