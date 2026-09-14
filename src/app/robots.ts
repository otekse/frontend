import type { MetadataRoute } from "next";
import { ABOUT_ENABLED } from "@/lib/about";
import { SHOP_ENABLED } from "@/lib/shop";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /api/locale is a redirect hop with no content worth crawling.
        disallow: [
          "/api/",
          ...(SHOP_ENABLED ? [] : ["/shop", "/cart"]),
          ...(ABOUT_ENABLED ? [] : ["/about"]),
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
