import type { MetadataRoute } from "next";
import { ABOUT_ENABLED } from "@/lib/about";
import { SHOP_ENABLED } from "@/lib/shop";

const SITE_URL = "https://xn--tekse-cua.ee";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /api/locale is a redirect hop with no content worth crawling.
        disallow: [
          "/api/",
          ...(SHOP_ENABLED ? [] : ["/shop", "/cart", "/checkout", "/order"]),
          ...(ABOUT_ENABLED ? [] : ["/about"]),
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
