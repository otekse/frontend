// Generates the optimized web images in public/images/ from the originals in
// assets-src/ (gitignored — originals live in the owner's Google Drive and the
// Claude Design project; see AGENTS.md "Styling" → Images).
//
//   npm run images:build
//
// Rerun whenever an original changes, and commit the outputs. Paths the app
// uses are defined once in src/content/assets.ts.
import sharp from "sharp";
import { readFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SRC = join(here, "..", "assets-src");
const OUT = join(here, "..", "public", "images");
mkdirSync(join(OUT, "members"), { recursive: true });

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
];

// Member avatars: the design's hand-positioned crops are embedded as webp data
// URIs in the design export's image-slot state. Extract + downscale them.
const slots = JSON.parse(readFileSync(join(SRC, "image-slots.state.json"), "utf8"));
const memberSlots = {
  "member-mirtel": "mirtel",
  "member-mirjam": "mirjam",
  "member-katlin": "katlin",
};
for (const [slot, name] of Object.entries(memberSlots)) {
  const dataUri = slots[slot]?.u;
  if (!dataUri?.startsWith("data:image/")) {
    console.error(`slot ${slot}: no embedded image found`);
    process.exit(1);
  }
  const buf = Buffer.from(dataUri.slice(dataUri.indexOf(",") + 1), "base64");
  jobs.push(
    sharp(buf)
      .resize({ width: 600, height: 600, fit: "cover", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(join(OUT, "members", `${name}.webp`)),
  );
}

const results = await Promise.all(jobs);
for (const r of results) {
  console.log(`${r.format} ${r.width}x${r.height} ${Math.round(r.size / 1024)}KB`);
}
console.log("done.");
