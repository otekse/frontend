import { defineRouting } from "next-intl/routing";

// Estonian stays the brand-primary locale, but it is no longer the fallback for
// real visitors: the middleware decides between `et` and `en` from a remembered
// choice, then IP geo, then Accept-Language (see src/i18n/resolve-locale.ts).
// `defaultLocale` now applies only to crawlers and as next-intl's structural
// default.
//
// localeDetection is off because next-intl's own negotiation would otherwise
// compete with ours. Note it also disables next-intl's cookie handling, which
// is why the middleware reads NEXT_LOCALE itself.
export const routing = defineRouting({
  locales: ["et", "en"],
  defaultLocale: "et",
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
