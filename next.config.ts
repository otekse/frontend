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
};

export default withNextIntl(nextConfig);
