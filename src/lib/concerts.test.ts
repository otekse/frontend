import { describe, it } from "node:test";
import assert from "node:assert/strict";
// Explicit .ts extension: Node's ESM resolver does not do extension guessing.
import {
  ConcertDataError,
  formatConcertDate,
  parseConcerts,
  splitConcerts,
  todayInTallinn,
  type Concert,
} from "./concerts.ts";

const base = {
  badge: "free" as const,
  title: { et: "Pealkiri", en: "Title" },
  info: { et: "Info", en: "Info" },
};

const concert = (over: Partial<Concert> = {}): Concert => ({
  start: "2026-08-23",
  ...base,
  ...over,
});

// The validator is the enforcement layer: the orchestrator's skill text is
// only advice, so anything it could get wrong has to fail the build here.
describe("parseConcerts", () => {
  it("accepts a minimal valid entry", () => {
    const out = parseConcerts({ concerts: [concert()] });
    assert.equal(out.length, 1);
    assert.equal(out[0].start, "2026-08-23");
  });

  it("ignores underscore-prefixed keys like _help", () => {
    const out = parseConcerts({ _help: "a note", concerts: [concert()] });
    assert.equal(out.length, 1);
  });

  it("rejects a file with no concerts array", () => {
    assert.throws(() => parseConcerts({}), ConcertDataError);
    assert.throws(() => parseConcerts(null), ConcertDataError);
    assert.throws(() => parseConcerts({ concerts: "nope" }), ConcertDataError);
  });

  it("rejects a date that does not exist", () => {
    // The regex alone would accept this; only the round-trip catches it.
    assert.throws(
      () => parseConcerts({ concerts: [concert({ start: "2026-06-31" })] }),
      /start must be a real date/,
    );
    assert.throws(
      () => parseConcerts({ concerts: [concert({ start: "2026-13-01" })] }),
      /start must be a real date/,
    );
  });

  it("rejects a non-ISO date", () => {
    assert.throws(
      () => parseConcerts({ concerts: [concert({ start: "23.06.2026" })] }),
      /start must be a real date/,
    );
  });

  it("rejects an end date before the start", () => {
    assert.throws(
      () =>
        parseConcerts({
          concerts: [concert({ start: "2026-07-24", end: "2026-07-23" })],
        }),
      /is before start/,
    );
  });

  it("rejects an unknown badge", () => {
    assert.throws(
      () =>
        parseConcerts({
          concerts: [{ ...concert(), badge: "cancelled" }],
        }),
      /badge must be one of/,
    );
  });

  it("rejects a missing or empty translation", () => {
    assert.throws(
      () =>
        parseConcerts({ concerts: [{ ...concert(), title: { et: "Vaid eesti" } }] }),
      /title\.en must be a non-empty string/,
    );
    assert.throws(
      () =>
        parseConcerts({
          concerts: [{ ...concert(), info: { et: "  ", en: "Info" } }],
        }),
      /info\.et must be a non-empty string/,
    );
  });

  it("rejects a non-https url", () => {
    assert.throws(
      () =>
        parseConcerts({
          concerts: [concert({ url: "http://example.com" })],
        }),
      /url must start with https/,
    );
  });

  it("names the offending entry by index", () => {
    assert.throws(
      () =>
        parseConcerts({
          concerts: [concert(), concert({ start: "bogus" })],
        }),
      /concerts\[1\]\.start/,
    );
  });
});

describe("splitConcerts", () => {
  const list = [
    concert({ start: "2026-06-23" }),
    concert({ start: "2026-08-23" }),
    concert({ start: "2026-07-23", end: "2026-07-24" }),
  ];

  it("keeps a concert upcoming on the day it happens", () => {
    const { upcoming, past } = splitConcerts(list, "2026-06-23");
    assert.deepEqual(
      upcoming.map((c) => c.start),
      ["2026-06-23", "2026-07-23", "2026-08-23"],
    );
    assert.equal(past.length, 0);
  });

  it("retires it the day after", () => {
    const { upcoming, past } = splitConcerts(list, "2026-06-24");
    assert.equal(past.length, 1);
    assert.equal(past[0].start, "2026-06-23");
    assert.equal(upcoming.length, 2);
  });

  it("keeps a multi-day concert upcoming through its end date", () => {
    const onLastDay = splitConcerts(list, "2026-07-24");
    assert.ok(onLastDay.upcoming.some((c) => c.start === "2026-07-23"));

    const dayAfter = splitConcerts(list, "2026-07-25");
    assert.ok(dayAfter.past.some((c) => c.start === "2026-07-23"));
  });

  it("sorts upcoming soonest-first and past most-recent-first", () => {
    const { upcoming, past } = splitConcerts(list, "2026-07-24");
    assert.deepEqual(
      upcoming.map((c) => c.start),
      ["2026-07-23", "2026-08-23"],
    );
    assert.deepEqual(
      past.map((c) => c.start),
      ["2026-06-23"],
    );
  });

  it("handles an all-past list", () => {
    const { upcoming, past } = splitConcerts(list, "2030-01-01");
    assert.equal(upcoming.length, 0);
    assert.equal(past.length, 3);
  });
});

describe("todayInTallinn", () => {
  it("uses the Tallinn date, not the UTC one", () => {
    // 22:00 UTC in summer is already 01:00 the next day in Tallinn (EEST).
    assert.equal(
      todayInTallinn(new Date("2026-06-22T22:00:00Z")),
      "2026-06-23",
    );
  });

  it("still reports the same day before the offset rolls over", () => {
    assert.equal(
      todayInTallinn(new Date("2026-06-22T12:00:00Z")),
      "2026-06-22",
    );
  });

  it("handles the winter offset too", () => {
    // EET (UTC+2) in January: 23:00 UTC is 01:00 the next day.
    assert.equal(
      todayInTallinn(new Date("2026-01-15T23:00:00Z")),
      "2026-01-16",
    );
  });
});

describe("formatConcertDate", () => {
  it("shows day and month for an upcoming concert", () => {
    assert.equal(
      formatConcertDate(concert({ start: "2026-06-23" }), "et", "upcoming"),
      "23.06",
    );
  });

  it("collapses a range inside one month", () => {
    const c = concert({ start: "2026-07-23", end: "2026-07-24" });
    assert.equal(formatConcertDate(c, "et", "upcoming"), "23–24.07");
  });

  it("spells out a range that crosses months", () => {
    const c = concert({ start: "2026-07-30", end: "2026-08-02" });
    assert.equal(formatConcertDate(c, "et", "upcoming"), "30.07–02.08");
  });

  it("adds the year in the archive", () => {
    assert.equal(
      formatConcertDate(concert({ start: "2026-06-23" }), "et", "past"),
      "23.06.2026",
    );
  });

  it("prefers displayDate, per locale, in either tense", () => {
    const c = concert({
      start: "2026-04-01",
      displayDate: { et: "2026 kevad", en: "Spring 2026" },
    });
    assert.equal(formatConcertDate(c, "et", "past"), "2026 kevad");
    assert.equal(formatConcertDate(c, "en", "past"), "Spring 2026");
    assert.equal(formatConcertDate(c, "en", "upcoming"), "Spring 2026");
  });
});
