import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SHOP_ENABLED } from "@/lib/shop";

const SITE_URL = "https://xn--tekse-cua.ee";

// Marketing surfaces only. Storefront paths come back automatically when the
// shop flag is turned on — they must never be advertised while they 404.
const PATHS = ["", "/privacy", ...(SHOP_ENABLED ? ["/shop"] : [])];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PATHS.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      lastModified,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, `${SITE_URL}/${l}${path}`]),
        ),
      },
    })),
  );
}
