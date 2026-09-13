// Generates the optimized web images in public/images/ from the originals in
// assets-src/ (gitignored — originals live in the owner's Google Drive and the
// Claude Design project; see AGENTS.md "Styling" → Images).
//
//   npm run images:build
//
// Rerun whenever an original changes, and commit the outputs. Paths the app
// uses are defined once in src/content/assets.ts.
import sharp from "sharp";
import { mkdirSync, readdirSync } from "node:fs";
import { join, dirname, parse } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SRC = join(here, "..", "assets-src");
const OUT = join(here, "..", "public", "images");
mkdirSync(join(OUT, "members"), { recursive: true });
mkdirSync(join(OUT, "concerts"), { recursive: true });
mkdirSync(join(OUT, "album"), { recursive: true });
mkdirSync(join(OUT, "timeline", "thumb"), { recursive: true });

const jobs = [
  // Hero forest photo — big display area, keep quality reasonable.
  sharp(join(SRC, "forest.jpg"))
    .resize({ width: 1920, withoutEnlargement: true })
    .jpeg({ quality: 78, mozjpeg: true })
    .toFile(join(OUT, "forest.jpg")),

  // Wheat texture strip — repeats horizontally, transparency at the top edge.
  sharp(join(SRC, "wheat.png"))
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 82, alphaQuality: 90 })
    .toFile(join(OUT, "wheat.webp")),

  // About-section band photo.
  sharp(join(SRC, "band.jpg"))
    .resize({ width: 1200, withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(join(OUT, "band.jpg")),

  // Hero cutout of the three sisters (needs alpha).
  sharp(join(SRC, "girls-cutout.png"))
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 85, alphaQuality: 92 })
    .toFile(join(OUT, "girls-cutout.webp")),

  // "Rannapiigad" cover in the album section's paper card, which is at most
  // 340px wide — 800px covers 2x displays. Square-cropped because the card is.
  sharp(join(SRC, "album-cover.png"))
    .resize({ width: 800, height: 800, fit: "cover" })
    .webp({ quality: 84 })
    .toFile(join(OUT, "album", "cover.webp")),
];

// Member avatars: square, face-focused crops from the hi-res originals
// (assets-src/<file>, 2400x3600). Each region is hand-tuned so the sister's
// face sits in a consistent head-and-torso framing before the 600px downscale.
const memberCrops = {
  mirtel: { file: "mirtel.jpg", left: 334, top: 476 },
  mirjam: { file: "mirjam.jpg", left: 640, top: 404 },
  katlin: { file: "kätlin.jpg", left: 640, top: 368 },
};
const CROP_SIDE = 1600;
for (const [name, c] of Object.entries(memberCrops)) {
  jobs.push(
    sharp(join(SRC, c.file))
      .extract({ left: c.left, top: c.top, width: CROP_SIDE, height: CROP_SIDE })
      .resize({ width: 600, height: 600, fit: "cover" })
      .webp({ quality: 85 })
      .toFile(join(OUT, "members", `${name}.webp`)),
  );
}

// Concert-hero photo cards. They render at 230–320px wide, so 900px covers
// 2x displays with room to spare; object-fit crops them to each card's aspect
// ratio, which is why no per-image cropping happens here.
for (const n of [1, 2, 3, 4]) {
  jobs.push(
    sharp(join(SRC, `live-${n}.jpg`))
      .resize({ width: 900, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(join(OUT, "concerts", `live-${n}.webp`)),
  );
}

// Timeline photos on the About page: every original in assets-src/timeline/,
// named after the id timeline.json uses for it. Two sizes, because the grid
// and the photo differ by 5x: a thumbnail that fits the ~150–260px grid cells
// at 2x, and the full photo each thumbnail opens in its own tab. Only the
// thumbnail is downloaded by the page itself.
//
// `rotate()` with no angle applies the EXIF orientation first, so phone
// photos taken upright do not come out sideways once the metadata is stripped.
for (const file of readdirSync(join(SRC, "timeline"))) {
  const { name } = parse(file);
  const original = () => sharp(join(SRC, "timeline", file)).rotate();
  jobs.push(
    original()
      .resize({ width: 560, height: 560, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 74 })
      .toFile(join(OUT, "timeline", "thumb", `${name}.webp`)),
    original()
      .resize({ width: 1400, height: 1400, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(join(OUT, "timeline", `${name}.webp`)),
  );
}

const results = await Promise.all(jobs);
for (const r of results) {
  console.log(`${r.format} ${r.width}x${r.height} ${Math.round(r.size / 1024)}KB`);
}
console.log("done.");
