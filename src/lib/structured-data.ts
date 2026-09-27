// Structured data (schema.org JSON-LD) for search engines.
//
// Pure: it takes everything it describes as arguments, so the tests drive it
// directly. Pages render the output through `components/JsonLd`.

import type { Concert, Venue } from "./concerts.ts";
import {
  SHARE_IMAGE,
  SITE_ALTERNATE_NAME,
  SITE_NAME,
  SITE_URL,
} from "./site.ts";

type Locale = "et" | "en";

const BAND_ID = `${SITE_URL}/#band`;

const GENRE: Record<Locale, string> = {
  et: "Pärimusmuusika",
  en: "Folk music",
};

/**
 * The homepage graph: the site, and the band behind it.
 *
 * `WebSite` is where Google takes the site name shown in results from; its
 * `alternateName` tells it that "Otekse", typed without the õ, is the same
 * site.
 */
export function homeJsonLd({
  locale,
  description,
  memberNames,
}: {
  locale: Locale;
  description: string;
  memberNames: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: SITE_NAME,
        alternateName: SITE_ALTERNATE_NAME,
        inLanguage: ["et", "en"],
      },
      {
        "@type": "MusicGroup",
        "@id": BAND_ID,
        name: SITE_NAME,
        alternateName: SITE_ALTERNATE_NAME,
        url: `${SITE_URL}/${locale}`,
        description,
        genre: GENRE[locale],
        image: SHARE_IMAGE.url,
        logo: `${SITE_URL}/icon.png`,
        member: memberNames.map((name) => ({ "@type": "Person", name })),
      },
    ],
  };
}

/**
 * One `MusicEvent` per upcoming concert that can honestly be described as one.
 *
 * Two kinds are left out rather than guessed at: a concert with no `venue`
 * (Google lists an event only with a location, and a wrong one is worse than
 * none), and one with a `displayDate` (its `start` is only a sort key, not the
 * real day). Both still show on the page as usual.
 *
 * Returns null when nothing qualifies, so the page renders no empty script.
 */
export function concertsJsonLd(upcoming: Concert[], locale: Locale) {
  const events = upcoming
    .filter((c): c is Concert & { venue: Venue } => !!c.venue && !c.displayDate)
    .map((c) => ({
      "@type": "MusicEvent",
      name: c.title[locale],
      description: c.info[locale],
      startDate: c.start,
      ...(c.end ? { endDate: c.end } : {}),
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: {
        "@type": "Place",
        name: c.venue.name,
        address: {
          "@type": "PostalAddress",
          addressLocality: c.venue.locality,
          addressCountry: c.venue.country ?? "EE",
        },
      },
      image: [SHARE_IMAGE.url],
      url: `${SITE_URL}/${locale}/concerts`,
      ...(c.url ? { sameAs: c.url } : {}),
      ...(c.badge === "free" ? { isAccessibleForFree: true } : {}),
      performer: {
        "@type": "MusicGroup",
        "@id": BAND_ID,
        name: SITE_NAME,
        url: SITE_URL,
      },
    }));

  return events.length > 0
    ? { "@context": "https://schema.org", "@graph": events }
    : null;
}

/**
 * JSON for a `<script>` body. `<` is escaped so that no string in the content
 * — concerts.json is AI-editable — can close the tag early.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
