import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Concert } from "./concerts.ts";
import {
  concertsJsonLd,
  homeJsonLd,
  serializeJsonLd,
} from "./structured-data.ts";

const concert = (over: Partial<Concert> = {}): Concert => ({
  start: "2026-11-07",
  badge: "ticketed",
  title: { et: "Tallinn, Philly Joe’s", en: "Tallinn, Philly Joe’s" },
  info: { et: "Esitluskontsert.", en: "Release concert." },
  venue: { name: "Philly Joe’s", locality: "Tallinn" },
  ...over,
});

describe("concertsJsonLd", () => {
  it("describes a concert with a venue as a MusicEvent", () => {
    const out = concertsJsonLd([concert()], "en");
    assert.ok(out);
    const [event] = out["@graph"];
    assert.equal(event["@type"], "MusicEvent");
    assert.equal(event.startDate, "2026-11-07");
    assert.equal(event.location.name, "Philly Joe’s");
    assert.equal(event.location.address.addressLocality, "Tallinn");
    assert.equal(event.url, "https://xn--tekse-cua.ee/en/concerts");
  });

  it("defaults the country to Estonia and keeps an explicit one", () => {
    const [home] = concertsJsonLd([concert()], "et")!["@graph"];
    assert.equal(home.location.address.addressCountry, "EE");

    const abroad = concert({
      venue: { name: "Esplanāde", locality: "Riga", country: "LV" },
    });
    const [riga] = concertsJsonLd([abroad], "et")!["@graph"];
    assert.equal(riga.location.address.addressCountry, "LV");
  });

  it("leaves out a concert without a venue rather than guessing one", () => {
    assert.equal(concertsJsonLd([concert({ venue: undefined })], "et"), null);
  });

  it("leaves out a concert whose real date is unknown", () => {
    const vague = concert({ displayDate: { et: "2026 kevad", en: "Spring 2026" } });
    assert.equal(concertsJsonLd([vague], "et"), null);
  });

  it("carries the end date, the free flag and the event's own page", () => {
    const festival = concert({
      start: "2026-07-23",
      end: "2026-07-24",
      badge: "free",
      url: "https://www.viljandifolk.ee/",
    });
    const [event] = concertsJsonLd([festival], "et")!["@graph"];
    assert.equal(event.endDate, "2026-07-24");
    assert.equal(event.isAccessibleForFree, true);
    assert.equal(event.sameAs, "https://www.viljandifolk.ee/");

    const [ticketed] = concertsJsonLd([concert()], "et")!["@graph"];
    assert.equal("endDate" in ticketed, false);
    assert.equal("isAccessibleForFree" in ticketed, false);
  });

  it("uses the requested language", () => {
    const [et] = concertsJsonLd([concert()], "et")!["@graph"];
    const [en] = concertsJsonLd([concert()], "en")!["@graph"];
    assert.equal(et.description, "Esitluskontsert.");
    assert.equal(en.description, "Release concert.");
  });
});

describe("homeJsonLd", () => {
  it("names the site and the band, with the name typed without õ", () => {
    const out = homeJsonLd({
      locale: "et",
      description: "Kirjeldus",
      memberNames: ["Mirjam", "Kätlin"],
    });
    const [site, band] = out["@graph"];
    assert.equal(site["@type"], "WebSite");
    assert.equal(site.url, "https://xn--tekse-cua.ee/");
    assert.equal(site.alternateName, "Otekse");
    assert.equal(band["@type"], "MusicGroup");
    assert.equal(band.url, "https://xn--tekse-cua.ee/et");
    assert.deepEqual(
      band.member,
      [
        { "@type": "Person", name: "Mirjam" },
        { "@type": "Person", name: "Kätlin" },
      ],
    );
  });
});

describe("serializeJsonLd", () => {
  it("cannot be broken out of its script tag by content", () => {
    const out = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
    assert.equal(out.includes("<"), false);
    assert.deepEqual(JSON.parse(out), {
      name: "</script><script>alert(1)</script>",
    });
  });
});
