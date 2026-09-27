import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { ABOUT_ENABLED } from "@/lib/about";
import { SHOP_ENABLED } from "@/lib/shop";
import { SITE_URL } from "@/lib/site";

// Marketing surfaces only. Flagged pages are listed exactly when their flag is
// on — they must never be advertised while they 404 (robots.ts disallows them
// in the meantime).
const PATHS = [
  "",
  "/concerts",
  ...(ABOUT_ENABLED ? ["/about"] : []),
  "/privacy",
  ...(SHOP_ENABLED ? ["/shop"] : []),
];

// No `lastModified`. The sitemap is generated at build, when the only date to
// hand is the deploy's, so every page would claim to have changed on every
// deploy — and search engines learn to ignore a lastmod that is always "now".
export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      alternates: {
        languages: {
          ...Object.fromEntries(
            routing.locales.map((l) => [l, `${SITE_URL}/${l}${path}`]),
          ),
          // Matches the pages' own hreflang (lib/metadata.ts).
          "x-default": `${SITE_URL}${path || "/"}`,
        },
      },
    })),
  );
}
