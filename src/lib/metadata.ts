import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { SHARE_IMAGE, SITE_NAME, SITE_URL } from "./site";

/**
 * Title, description, canonical, hreflang and share tags for one page in both
 * languages. `path` is the locale-less path: "" for the homepage, "/concerts"…
 *
 * Every page under `[locale]` must call this from its own `generateMetadata`.
 * The canonical deliberately lives nowhere higher up: a canonical set in a
 * layout is inherited by every page that forgets to set its own, which is how
 * /privacy once told search engines it was a copy of the homepage.
 */
export function localizedPageMetadata({
  locale,
  path,
  title,
  description,
}: {
  locale: string;
  path: string;
  title: string;
  description: string;
}): Metadata {
  const url = `/${locale}${path}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(routing.locales.map((l) => [l, `/${l}${path}`])),
        // x-default is the URL that performs the language negotiation — the
        // unprefixed path — not an alias for either language tree.
        "x-default": path || "/",
      },
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: locale === "et" ? "et_EE" : "en_GB",
      title,
      description,
      url: `${SITE_URL}${url}`,
      images: [SHARE_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [SHARE_IMAGE],
    },
  };
}
