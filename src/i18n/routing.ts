import { defineRouting } from "next-intl/routing";

// Estonian is the brand-primary locale; English is the fallback for everyone
// else. localeDetection negotiates from the visitor's Accept-Language header:
// Estonian-preferring browsers get `et`, others get `en`. (True IP-geo routing
// — "English unless physically in Estonia" — would be a later enhancement.)
export const routing = defineRouting({
  locales: ["et", "en"],
  defaultLocale: "et",
  localeDetection: true,
});

export type Locale = (typeof routing.locales)[number];
