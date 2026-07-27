import type { MetadataRoute } from "next";
import { SHOP_ENABLED } from "@/lib/shop";

const SITE_URL = "https://xn--tekse-cua.ee";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /api/locale is a redirect hop with no content worth crawling.
        disallow: SHOP_ENABLED
          ? ["/api/"]
          : ["/api/", "/shop", "/cart", "/checkout", "/order"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
