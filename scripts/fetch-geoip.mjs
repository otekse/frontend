// Downloads the DB-IP "IP to Country Lite" database used to pick a first-time
// visitor's language (see the public-launch design §3).
//
// Fails soft on purpose: if db-ip.com is unreachable the build still succeeds
// and locale resolution falls back to Accept-Language. Never exits non-zero.
//
// Data by DB-IP, licensed CC-BY-4.0:
// https://db-ip.com/db/download/ip-to-country-lite

import { createWriteStream } from "node:fs";
import { mkdir, rename, stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { createGunzip } from "node:zlib";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "geoip");
const OUT_FILE = path.join(OUT_DIR, "dbip-country-lite.mmdb");

function monthKey(monthsAgo) {
  const d = new Date();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() - monthsAgo);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

async function download(month) {
  const url = `https://download.db-ip.com/free/dbip-country-lite-${month}.mmdb.gz`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  // Write to a temp file first so a failed download cannot leave a truncated
  // database behind for the app to read.
  const tmp = `${OUT_FILE}.tmp`;
  await pipeline(
    Readable.fromWeb(response.body),
    createGunzip(),
    createWriteStream(tmp),
  );
  await rename(tmp, OUT_FILE);

  const { size } = await stat(OUT_FILE);
  console.log(`[geoip] ${month} database ready (${(size / 1e6).toFixed(1)} MB)`);
}

await mkdir(OUT_DIR, { recursive: true });

// The new month's file appears a day or two into the month, so fall back.
for (const month of [monthKey(0), monthKey(1)]) {
  try {
    await download(month);
    process.exit(0);
  } catch (error) {
    console.warn(`[geoip] ${month} unavailable: ${error.message}`);
  }
}

console.warn(
  "[geoip] no database downloaded — locale falls back to Accept-Language",
);
process.exit(0);
