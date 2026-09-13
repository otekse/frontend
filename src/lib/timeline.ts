// Timeline types and validation for the About page's "what we have been up to".
//
// Same split as concerts (see lib/concerts.ts): the data lives in
// `src/content/timeline.json`, which the runtime orchestrator may edit, and the
// rules that check it live here, outside that directory. Pure and
// dependency-free, so the tests drive it directly.

type Localized = { et: string; en: string };

export type TimelineEntry = {
  /**
   * The date as shown, per locale ("22.01" / "22 Jan"). Free text rather than
   * ISO because the band's own record is often vaguer than a day ("kevad").
   * Optional: some entries only have their year.
   */
  when?: Localized;
  title: Localized;
  /** A sentence or two more, for entries the title alone does not carry. */
  body?: Localized;
  /** Recordings, videos and articles. https only. */
  links: string[];
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

function requireLocalized(value: unknown, where: string): Localized {
  if (!value || typeof value !== "object") {
    throw new TimelineDataError(`${where} must be an object with "et" and "en"`);
  }
  const v = value as Record<string, unknown>;
  for (const loc of ["et", "en"] as const) {
    if (typeof v[loc] !== "string" || (v[loc] as string).trim() === "") {
      throw new TimelineDataError(`${where}.${loc} must be a non-empty string`);
    }
  }
  return { et: v.et as string, en: v.en as string };
}

function optionalStrings(
  value: unknown,
  where: string,
  check: (s: string) => boolean,
  rule: string,
): string[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    throw new TimelineDataError(`${where} must be a list`);
  }
  return value.map((item, i) => {
    if (typeof item !== "string" || !check(item)) {
      throw new TimelineDataError(
        `${where}[${i}] ${rule} (got ${JSON.stringify(item)})`,
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
    ...(e.when !== undefined
      ? { when: requireLocalized(e.when, `${where}.when`) }
      : {}),
    title: requireLocalized(e.title, `${where}.title`),
    ...(e.body !== undefined
      ? { body: requireLocalized(e.body, `${where}.body`) }
      : {}),
    links: optionalStrings(
      e.links,
      `${where}.links`,
      (s) => s.startsWith("https://"),
      "must start with https://",
    ),
    photos: optionalStrings(
      e.photos,
      `${where}.photos`,
      (s) => PHOTO_ID.test(s),
      "must be lowercase letters, digits and hyphens, without a file extension",
    ),
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

/**
 * A short label for an outbound link: the site it goes to. Readers want to
 * know "this opens YouTube", and a hostname needs no translation.
 */
export function linkLabel(url: string): string {
  const host = new URL(url).hostname.replace(/^(www|m)\./, "");
  return host === "youtu.be" ? "youtube.com" : host;
}
