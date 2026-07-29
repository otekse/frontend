// Concert types, validation, and the upcoming/past split.
//
// This lives in lib/, not content/, on purpose. `src/content/` is the
// directory the runtime orchestrator is allowed to edit (PROJECT_BRIEF.md
// §10), so the *data* is editable but the rules that check it are not.
//
// Pure and dependency-free: no JSON import, no clock unless one is passed in,
// so every function here is driven directly by the tests.

export type ConcertBadge = "free" | "ticketed" | "soon";

type Localized = { et: string; en: string };

export type Concert = {
  /** ISO YYYY-MM-DD. Decides both sort order and upcoming vs past. */
  start: string;
  /** ISO YYYY-MM-DD for multi-day events; the concert is upcoming through it. */
  end?: string;
  /**
   * Overrides the date shown on screen. Only for historical entries whose
   * exact date we do not know ("2021", "2026 kevad") — they still need a
   * `start` to sort by, and this keeps that invented precision off the page.
   */
  displayDate?: Localized;
  /**
   * Keeps an entry in the file but off the site — for a date that is not
   * public yet, or one that fell through. Deleting loses the text; hiding
   * keeps it a single word away from coming back.
   */
  hidden?: boolean;
  badge: ConcertBadge;
  url?: string;
  title: Localized;
  info: Localized;
};

/** How many upcoming concerts the homepage teaser shows before linking out. */
export const TEASER_COUNT = 3;

const BADGES: readonly ConcertBadge[] = ["free", "ticketed", "soon"];
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export class ConcertDataError extends Error {
  constructor(message: string) {
    super(`concerts.json: ${message}`);
    this.name = "ConcertDataError";
  }
}

/**
 * True only for a date that actually exists. The regex alone accepts
 * 2026-06-31, which `new Date()` silently rolls forward to 1 July — so
 * round-trip it and require the same string back.
 */
function isRealDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

function requireLocalized(value: unknown, where: string): Localized {
  if (!value || typeof value !== "object") {
    throw new ConcertDataError(`${where} must be an object with "et" and "en"`);
  }
  const v = value as Record<string, unknown>;
  for (const loc of ["et", "en"] as const) {
    if (typeof v[loc] !== "string" || (v[loc] as string).trim() === "") {
      throw new ConcertDataError(`${where}.${loc} must be a non-empty string`);
    }
  }
  return { et: v.et as string, en: v.en as string };
}

/**
 * Validate one entry. Messages name the exact field: the orchestrator reads
 * build output to correct an edit it just made, so "concerts[3].badge must be
 * one of free | ticketed | soon" is worth more than "invalid data".
 */
function parseConcert(input: unknown, index: number): Concert {
  const where = `concerts[${index}]`;
  if (!input || typeof input !== "object") {
    throw new ConcertDataError(`${where} must be an object`);
  }
  const c = input as Record<string, unknown>;

  if (typeof c.start !== "string" || !isRealDate(c.start)) {
    throw new ConcertDataError(
      `${where}.start must be a real date as YYYY-MM-DD (got ${JSON.stringify(c.start)})`,
    );
  }
  if (c.end !== undefined) {
    if (typeof c.end !== "string" || !isRealDate(c.end)) {
      throw new ConcertDataError(
        `${where}.end must be a real date as YYYY-MM-DD (got ${JSON.stringify(c.end)})`,
      );
    }
    if (c.end < c.start) {
      throw new ConcertDataError(
        `${where}.end (${c.end}) is before start (${c.start})`,
      );
    }
  }
  if (
    typeof c.badge !== "string" ||
    !BADGES.includes(c.badge as ConcertBadge)
  ) {
    throw new ConcertDataError(
      `${where}.badge must be one of ${BADGES.join(" | ")} (got ${JSON.stringify(c.badge)})`,
    );
  }
  if (
    c.url !== undefined &&
    (typeof c.url !== "string" || !c.url.startsWith("https://"))
  ) {
    throw new ConcertDataError(
      `${where}.url must start with https:// (got ${JSON.stringify(c.url)})`,
    );
  }
  // Caught explicitly because the string "false" is truthy — the one mistake
  // that would silently hide a concert the moderator meant to show.
  if (c.hidden !== undefined && typeof c.hidden !== "boolean") {
    throw new ConcertDataError(
      `${where}.hidden must be true or false without quotes (got ${JSON.stringify(c.hidden)})`,
    );
  }

  return {
    start: c.start,
    ...(c.end !== undefined ? { end: c.end as string } : {}),
    ...(c.hidden !== undefined ? { hidden: c.hidden as boolean } : {}),
    ...(c.displayDate !== undefined
      ? { displayDate: requireLocalized(c.displayDate, `${where}.displayDate`) }
      : {}),
    badge: c.badge as ConcertBadge,
    ...(c.url !== undefined ? { url: c.url as string } : {}),
    title: requireLocalized(c.title, `${where}.title`),
    info: requireLocalized(c.info, `${where}.info`),
  };
}

/** Validate the whole file. Throws on the first problem it finds. */
export function parseConcerts(input: unknown): Concert[] {
  if (
    !input ||
    typeof input !== "object" ||
    !Array.isArray((input as { concerts?: unknown }).concerts)
  ) {
    throw new ConcertDataError('missing a top-level "concerts" array');
  }
  return (input as { concerts: unknown[] }).concerts.map(parseConcert);
}

/**
 * Today's date in Tallinn, as YYYY-MM-DD.
 *
 * The server runs in UTC and Estonia is UTC+2/+3, so comparing against UTC
 * would retire a concert up to three hours early. Formatting in the zone and
 * comparing ISO strings sidesteps both that and DST arithmetic — ISO dates
 * sort lexicographically in chronological order.
 */
export function todayInTallinn(now: Date = new Date()): string {
  // "en-CA" is the locale that formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Tallinn",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/**
 * Split by date. A concert stays upcoming for the whole of its final day —
 * people look an event up on the day they are attending it.
 *
 * Hidden entries appear in neither list: they stay in the file, off the site.
 *
 * Upcoming reads soonest-first; the archive reads most-recent-first.
 */
export function splitConcerts(
  list: Concert[],
  today: string = todayInTallinn(),
): { upcoming: Concert[]; past: Concert[] } {
  const upcoming: Concert[] = [];
  const past: Concert[] = [];

  for (const c of list) {
    if (c.hidden) continue;
    if ((c.end ?? c.start) >= today) upcoming.push(c);
    else past.push(c);
  }

  upcoming.sort((a, b) => a.start.localeCompare(b.start));
  past.sort((a, b) => b.start.localeCompare(a.start));
  return { upcoming, past };
}

const dayMonth = (iso: string) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}`;

/**
 * The date as shown on screen. `displayDate` wins when present; otherwise it
 * is derived. The archive carries the year, because "23.06" says little once
 * the year is gone.
 */
export function formatConcertDate(
  concert: Concert,
  locale: "et" | "en",
  tense: "upcoming" | "past",
): string {
  if (concert.displayDate) return concert.displayDate[locale];

  const { start, end } = concert;
  if (tense === "past") return `${dayMonth(start)}.${start.slice(0, 4)}`;
  if (!end || end === start) return dayMonth(start);
  // En dash, matching the design's "23–24.07".
  return start.slice(5, 7) === end.slice(5, 7)
    ? `${start.slice(8, 10)}–${dayMonth(end)}`
    : `${dayMonth(start)}–${dayMonth(end)}`;
}
