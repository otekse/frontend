// Timeline types and validation for the About page's "AJATELG".
//
// Same split as concerts (see lib/concerts.ts): the data lives in
// `src/content/timeline.json`, which the runtime orchestrator may edit, and the
// rules that check it live here, outside that directory. Pure and
// dependency-free, so the tests drive it directly.
//
// The shape follows the Claude Design export (`Otekse - Meist`): each entry is
// a date as shown, one text, labelled links and photos.

type Localized = { et: string; en: string };

export type TimelineLink = { url: string; label: string };

export type TimelineEntry = {
  /**
   * The date exactly as displayed ("22.01.2026", "Kevad 2026"). Free text
   * because the band's own record is often vaguer than a day. In the file it
   * may be one string for both languages, or `{ "et", "en" }` when they differ.
   */
  date?: Localized;
  text: Localized;
  /** Recordings, videos and articles, each with its pill label. https only. */
  links: TimelineLink[];
  /** Photo ids: file names under public/images/timeline/, without extension. */
  photos: string[];
};

export type TimelineYear = { year: number; entries: TimelineEntry[] };

export class TimelineDataError extends Error {
  constructor(message: string) {
    super(`timeline.json: ${message}`);
    this.name = "TimelineDataError";
  }
}

// Lowercase words joined by hyphens: the id doubles as a file name, so no
// spaces, no diacritics, and nothing that could climb out of the directory.
const PHOTO_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const nonEmpty = (v: unknown): v is string =>
  typeof v === "string" && v.trim() !== "";

function requireLocalized(value: unknown, where: string): Localized {
  if (!value || typeof value !== "object") {
    throw new TimelineDataError(`${where} must be an object with "et" and "en"`);
  }
  const v = value as Record<string, unknown>;
  for (const loc of ["et", "en"] as const) {
    if (!nonEmpty(v[loc])) {
      throw new TimelineDataError(`${where}.${loc} must be a non-empty string`);
    }
  }
  return { et: v.et as string, en: v.en as string };
}

function parseDate(value: unknown, where: string): Localized {
  if (typeof value === "string") {
    if (!nonEmpty(value)) {
      throw new TimelineDataError(`${where} must not be empty`);
    }
    return { et: value, en: value };
  }
  return requireLocalized(value, where);
}

function parseLinks(value: unknown, where: string): TimelineLink[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    throw new TimelineDataError(`${where} must be a list`);
  }
  return value.map((item, i) => {
    const l = (item ?? {}) as Record<string, unknown>;
    if (typeof l.url !== "string" || !l.url.startsWith("https://")) {
      throw new TimelineDataError(
        `${where}[${i}].url must start with https:// (got ${JSON.stringify(l.url)})`,
      );
    }
    if (!nonEmpty(l.label)) {
      throw new TimelineDataError(`${where}[${i}].label must be a non-empty string`);
    }
    return { url: l.url, label: l.label };
  });
}

function parsePhotos(value: unknown, where: string): string[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    throw new TimelineDataError(`${where} must be a list`);
  }
  return value.map((item, i) => {
    if (typeof item !== "string" || !PHOTO_ID.test(item)) {
      throw new TimelineDataError(
        `${where}[${i}] must be lowercase letters, digits and hyphens, without a file extension (got ${JSON.stringify(item)})`,
      );
    }
    return item;
  });
}

function parseEntry(input: unknown, where: string): TimelineEntry {
  if (!input || typeof input !== "object") {
    throw new TimelineDataError(`${where} must be an object`);
  }
  const e = input as Record<string, unknown>;

  return {
    ...(e.date !== undefined ? { date: parseDate(e.date, `${where}.date`) } : {}),
    text: requireLocalized(e.text, `${where}.text`),
    links: parseLinks(e.links, `${where}.links`),
    photos: parsePhotos(e.photos, `${where}.photos`),
  };
}

function parseYear(input: unknown, index: number): TimelineYear {
  const where = `years[${index}]`;
  if (!input || typeof input !== "object") {
    throw new TimelineDataError(`${where} must be an object`);
  }
  const y = input as Record<string, unknown>;

  if (
    typeof y.year !== "number" ||
    !Number.isInteger(y.year) ||
    y.year < 2000 ||
    y.year > 2100
  ) {
    throw new TimelineDataError(
      `${where}.year must be a four-digit year without quotes (got ${JSON.stringify(y.year)})`,
    );
  }
  if (!Array.isArray(y.entries) || y.entries.length === 0) {
    throw new TimelineDataError(`${where}.entries must be a non-empty list`);
  }

  return {
    year: y.year,
    entries: y.entries.map((e, i) => parseEntry(e, `${where}.entries[${i}]`)),
  };
}

/**
 * Validate the whole file. Throws on the first problem it finds.
 *
 * Years come back newest first whatever order they were written in, and a year
 * written twice is an error rather than two headings. Entries keep the order
 * they were written in — within a year the band's record reads as a diary.
 */
export function parseTimeline(input: unknown): TimelineYear[] {
  if (
    !input ||
    typeof input !== "object" ||
    !Array.isArray((input as { years?: unknown }).years)
  ) {
    throw new TimelineDataError('missing a top-level "years" list');
  }
  const years = (input as { years: unknown[] }).years.map(parseYear);

  const seen = new Set<number>();
  for (const { year } of years) {
    if (seen.has(year)) {
      throw new TimelineDataError(
        `${year} appears twice — put all of its entries under one year`,
      );
    }
    seen.add(year);
  }

  return years.sort((a, b) => b.year - a.year);
}

/** Every photo id the timeline uses, in order. */
export function timelinePhotoIds(years: TimelineYear[]): string[] {
  return years.flatMap((y) => y.entries.flatMap((e) => e.photos));
}
