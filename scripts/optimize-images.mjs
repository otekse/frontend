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

// Emits one file per width, so the browser can fetch the size that matches the
// space the image will fill instead of the largest one there is. The widest
// width keeps the plain name that src/content/assets.ts points at; narrower
// ones get a `-<width>` suffix, which is the shape srcSetFor() expects.
const widths = (list, out, pipeline) => {
  const max = Math.max(...list);
  return list.map((w) =>
    pipeline(w).toFile(
      join(OUT, w === max ? out : out.replace(/\.webp$/, `-${w}.webp`)),
    ),
  );
};

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

  // The two enhanced hero photos. Unlike everything else here they arrived
  // already retouched and have no raw original — assets-src holds the version
  // the owner supplied, and this only re-compresses it. q70 rather than the q80
  // they came at: 506KB -> 364KB and 532KB -> 378KB, so 295KB saved across the
  // two, with nothing to show for it even side by side at full size (PSNR
  // 33.4 dB). They are the heaviest files the homepage loads, so this is the
  // single biggest saving here.
  sharp(join(SRC, "forest-enhanced.webp"))
    .webp({ quality: 70 })
    .toFile(join(OUT, "forest-enhanced.webp")),
  sharp(join(SRC, "wheat-enhanced.webp"))
    .webp({ quality: 70, alphaQuality: 90 })
    .toFile(join(OUT, "wheat-enhanced.webp")),

  // And both again as AVIF, for the browsers that can choose it (the
  // photo-background mixin): 365KB -> 250KB and 378KB -> 213KB. q55 because
  // q50 started smoothing the wheat's grain at 2x zoom; q55 held it as well as
  // the WebP does.
  sharp(join(SRC, "forest-enhanced.webp"))
    .avif({ quality: 55, effort: 6 })
    .toFile(join(OUT, "forest-enhanced.avif")),
  sharp(join(SRC, "wheat-enhanced.webp"))
    .avif({ quality: 55, effort: 6 })
    .toFile(join(OUT, "wheat-enhanced.avif")),

  // About-section band photo — a grainy, detailed picture, so it encodes
  // expensively and the usual defaults go the wrong way: at q80 WebP came out
  // *larger* (359KB) than the 333KB mozjpeg it was meant to replace. q74 is
  // where WebP starts winning (259KB against 278KB at 1200px).
  //
  // Nothing wider than 1000 is generated: the arch this fills is never wider
  // than 437 CSS px, so 1000 already covers a 2x screen, and the phones with a
  // denser screen than that show the photo full-width, where they take the 800.
  ...widths([480, 800, 1000], "band.webp", (w) =>
    sharp(join(SRC, "band.jpg"))
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: 74 }),
  ),

  // Hero cutout of the three sisters (needs alpha).
  ...widths([600, 900, 1200], "girls-cutout.webp", (w) =>
    sharp(join(SRC, "girls-cutout.png"))
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: 85, alphaQuality: 92 }),
  ),

  // Poster for the Hooandja campaign video (AlbumVideo): the frame at 2s of
  // the Full HD master, shown until a visitor presses play. 1440px because
  // the frame shows only the middle third of the picture, about 3x magnified,
  // so the 960px poster looked soft next to the HD video it stands in for.
  // AlbumVideo only sets it once the video is near the viewport.
  sharp(join(SRC, "album-video-poster.png"))
    .resize({ width: 1440, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(join(OUT, "album", "video-poster.webp")),

  // Share image for links posted to social media and chat apps (Open Graph /
  // X), set on every page by lib/metadata.ts. The beach photo — all three
  // sisters with their instruments — at the 1200x630 the platforms expect:
  // scaled to 1200x900, then cropped from just below the top of the sky to the
  // knees.
  sharp(join(SRC, "live-3.jpg"))
    .resize({ width: 1200 })
    .extract({ left: 0, top: 90, width: 1200, height: 630 })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(join(OUT, "share.jpg")),
];

// Stills of the album section that the header's "Uus album!" button opens
// into on page load (AlbumButton), one per language because the title quotes
// and credits differ. Screenshots of the section's scene in the owner's crop:
// 1307x687 from a 1905px-wide page, from the top of the scene, with the header
// and the video card hidden, so it shows the waves and the title only.
// Retake them when the section changes. The card is at most 420px wide, so
// 840px covers 2x displays. AlbumButton's PREVIEW_RATIO is 1307/687.
for (const locale of ["et", "en"]) {
  jobs.push(
    sharp(join(SRC, `album-preview-${locale}.png`))
      .resize({ width: 840 })
      .webp({ quality: 80 })
      .toFile(join(OUT, "album", `preview-${locale}.webp`)),
  );
}

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
    ...widths([240, 400, 600], `members/${name}.webp`, (w) =>
      sharp(join(SRC, c.file))
        .extract({ left: c.left, top: c.top, width: CROP_SIDE, height: CROP_SIDE })
        .resize({ width: w, height: w, fit: "cover" })
        .webp({ quality: 85 }),
    ),
  );
}

// Concert-hero photo cards. They render at 230–320px wide, so 900px covers
// 2x displays with room to spare; object-fit crops them to each card's aspect
// ratio, which is why no per-image cropping happens here.
for (const n of [1, 2, 3, 4]) {
  jobs.push(
    ...widths([450, 640, 900], `concerts/live-${n}.webp`, (w) =>
      sharp(join(SRC, `live-${n}.jpg`))
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: 82 }),
    ),
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
    ...widths([280, 560], `timeline/thumb/${name}.webp`, (w) =>
      original()
        .resize({ width: w, height: w, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 74 }),
    ),
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
