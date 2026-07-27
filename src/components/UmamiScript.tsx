import Script from "next/script";

// Self-hosted, cookieless analytics (PROJECT_BRIEF.md §8). Renders only when
// both variables are set, so dev and preview builds never write into the
// production statistics.
export function UmamiScript() {
  const src = process.env.NEXT_PUBLIC_UMAMI_URL;
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  if (!src || !websiteId) return null;

  return (
    <Script
      src={src}
      data-website-id={websiteId}
      strategy="afterInteractive"
      defer
    />
  );
}
