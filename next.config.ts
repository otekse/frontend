import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  experimental: {
    // Route changes are client-side already; this adds a native crossfade for
    // the locale content so the language switch does not visibly flash.
    viewTransition: true,
  },
  // õtekse.ee is canonical; www redirects to it. Kept here rather than in
  // Coolify so the rule is version-controlled. Punycode because that is what
  // arrives in the Host header.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.xn--tekse-cua.ee" }],
        destination: "https://xn--tekse-cua.ee/:path*",
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      {
        // Next serves everything in public/ as `max-age=0`, so the browser has
        // to revalidate before it may reuse a cached body. For the ~3MB tracks
        // that means a round-trip in front of every play, and a re-download
        // whenever the cache is evicted — on a phone, during playback, that
        // competes with the images the visitor is actually looking at.
        //
        // A week, deliberately NOT `immutable`: the filenames carry no content
        // hash, so a track replaced in place still propagates on its own. If a
        // track ever needs to change sooner than that, rename the file and
        // update src/content/music.ts — same edit, instant invalidation.
        source: "/audio/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=604800" },
        ],
      },
      {
        // A week of caching saves a revalidation round-trip per image per
        // visit; NOT `immutable`, because the filenames carry no content hash.
        // The cost: an image rebuilt under the same name can show its old
        // version to a returning visitor for up to a week. One that must change
        // at once gets a new name instead (as the video poster did).
        source: "/images/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=604800" },
        ],
      },
      {
        // Same for the icons, which every page load asks for.
        source: "/:file(favicon.ico|icon.png|apple-icon.png|icon-192.png|icon-512.png)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=604800" },
        ],
      },
      {
        // The Hooandja campaign video (~26 MB): same reasoning, and the same
        // rule as the tracks — a replaced video needs a new filename, or anyone
        // who has already played the old one keeps getting it for a week. That
        // happened once: the Full HD encode first went in under the old name,
        // and the browser that had played the old file kept playing it.
        source: "/videos/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=604800" },
        ],
      },
      // The page language, for crawlers that read the HTML without running
      // scripts. `<html lang>` cannot carry it: the document shell sits above
      // the [locale] segment (src/app/layout.tsx), so the server-rendered
      // attribute is the same in both language trees.
      {
        source: "/et/:path*",
        headers: [{ key: "Content-Language", value: "et" }],
      },
      {
        source: "/en/:path*",
        headers: [{ key: "Content-Language", value: "en" }],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
