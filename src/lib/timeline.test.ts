import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
// Explicit .ts extension: Node's ESM resolver does not do extension guessing.
import {
  TimelineDataError,
  parseTimeline,
  timelinePhotoIds,
} from "./timeline.ts";

const entry = (over: Record<string, unknown> = {}) => ({
  text: { et: "Tekst", en: "Text" },
  ...over,
});

const year = (y: unknown, entries: unknown = [entry()]) => ({ year: y, entries });

const one = (e: Record<string, unknown>) =>
  parseTimeline({ years: [year(2025, [entry(e)])] })[0].entries[0];

describe("parseTimeline", () => {
  it("accepts a minimal entry and defaults links and photos to empty", () => {
    const [y] = parseTimeline({ years: [year(2026)] });
    assert.equal(y.year, 2026);
    assert.deepEqual(y.entries[0].links, []);
    assert.deepEqual(y.entries[0].photos, []);
    assert.equal(y.entries[0].date, undefined);
  });

  it("ignores underscore-prefixed keys like _help", () => {
    assert.equal(parseTimeline({ _help: "a note", years: [year(2026)] }).length, 1);
  });

  it("uses a plain date string for both languages", () => {
    assert.deepEqual(one({ date: "22.01.2026" }).date, {
      et: "22.01.2026",
      en: "22.01.2026",
    });
  });

  it("keeps a per-language date when they differ", () => {
    assert.deepEqual(one({ date: { et: "Kevad 2026", en: "Spring 2026" } }).date, {
      et: "Kevad 2026",
      en: "Spring 2026",
    });
  });

  it("puts the newest year first but keeps each year's entries in order", () => {
    const out = parseTimeline({
      years: [
        year(2021),
        year(2026, [
          entry({ text: { et: "Esimene", en: "First" } }),
          entry({ text: { et: "Teine", en: "Second" } }),
        ]),
        year(2024),
      ],
    });
    assert.deepEqual(
      out.map((y) => y.year),
      [2026, 2024, 2021],
    );
    assert.deepEqual(
      out[0].entries.map((e) => e.text.en),
      ["First", "Second"],
    );
  });

  it("rejects a file with no years list", () => {
    assert.throws(() => parseTimeline({}), TimelineDataError);
    assert.throws(() => parseTimeline(null), TimelineDataError);
  });

  it("rejects a quoted or implausible year", () => {
    assert.throws(
      () => parseTimeline({ years: [year("2026")] }),
      /year must be a four-digit year without quotes/,
    );
    assert.throws(
      () => parseTimeline({ years: [year(26)] }),
      /year must be a four-digit year/,
    );
  });

  it("rejects a year written twice", () => {
    assert.throws(
      () => parseTimeline({ years: [year(2025), year(2025)] }),
      /2025 appears twice/,
    );
  });

  it("rejects a year with no entries", () => {
    assert.throws(
      () => parseTimeline({ years: [year(2025, [])] }),
      /years\[0\]\.entries must be a non-empty list/,
    );
  });

  it("names the entry with a missing translation", () => {
    assert.throws(
      () =>
        parseTimeline({
          years: [year(2025, [entry(), entry({ text: { et: "Vaid eesti" } })])],
        }),
      /years\[0\]\.entries\[1\]\.text\.en must be a non-empty string/,
    );
  });

  it("rejects an empty date", () => {
    assert.throws(() => one({ date: " " }), /date must not be empty/);
  });

  it("requires every link to be https and labelled", () => {
    assert.deepEqual(one({ links: [{ url: "https://youtu.be/x", label: "YouTube" }] }).links, [
      { url: "https://youtu.be/x", label: "YouTube" },
    ]);
    assert.throws(
      () => one({ links: [{ url: "http://example.com", label: "X" }] }),
      /links\[0\]\.url must start with https/,
    );
    assert.throws(
      () => one({ links: [{ url: "https://example.com" }] }),
      /links\[0\]\.label must be a non-empty string/,
    );
  });

  it("rejects a photo given as a file name or a path", () => {
    for (const bad of ["2025-haapsalu-1.jpg", "../secret", "Haapsalu 1"]) {
      assert.throws(
        () => one({ photos: [bad] }),
        /photos\[0\] must be lowercase letters, digits and hyphens/,
      );
    }
  });
});

// The real file, checked against the images actually committed: a photo id
// with no optimized image behind it would render as a broken placeholder.
describe("timeline.json", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const raw = JSON.parse(
    readFileSync(join(here, "..", "content", "timeline.json"), "utf8"),
  );
  const ids = timelinePhotoIds(parseTimeline(raw));
  const images = join(here, "..", "..", "public", "images", "timeline");

  it("has both image sizes for every photo it names", () => {
    const missing = ids.filter(
      (id) =>
        !existsSync(join(images, `${id}.webp`)) ||
        !existsSync(join(images, "thumb", `${id}.webp`)),
    );
    assert.deepEqual(missing, []);
  });

  it("uses each photo only once", () => {
    assert.equal(new Set(ids).size, ids.length);
  });
});
