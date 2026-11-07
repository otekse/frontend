import en from "../../../messages/en.json";
import { ABOUT_ENABLED } from "@/lib/about";
import { buildLlmsTxt } from "@/lib/llms-txt";
import { SHOP_ENABLED } from "@/lib/shop";

// Built once at build time, from the same copy as the site (see lib/llms-txt).
// Flagged pages follow the build-time flags, as in sitemap.ts.
export const dynamic = "force-static";

export function GET() {
  const body = buildLlmsTxt({
    summary: en.Meta.description,
    about: [en.About.s1Body, en.About.s2Body, en.About.s3Body],
    aboutEnabled: ABOUT_ENABLED,
    shopEnabled: SHOP_ENABLED,
  });
  return new Response(body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
