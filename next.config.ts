import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
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
    ];
  },
};

export default withNextIntl(nextConfig);
