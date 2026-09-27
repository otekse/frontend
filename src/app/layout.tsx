import type { Metadata } from "next";
import { Archivo_Black, Space_Mono } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import { UmamiScript } from "@/components/UmamiScript";
import { albumPromoActive } from "@/lib/album";
import { todayInTallinn } from "@/lib/concerts";
import { shopEnabled } from "@/lib/shop-server";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

// Every relative URL in the metadata of every page (canonical, hreflang)
// resolves against the canonical origin.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
};

// Runs before first paint. `lang` cannot come from the route in this layout,
// which sits above [locale] (see below), so the server always sends Estonian —
// the default locale — and this corrects it on English pages before a screen
// reader or translation prompt reads it. Same rule as AppShell's getLocale;
// LocaleDocumentAttributes keeps it right across client-side navigations.
// Crawlers that do not run scripts get the language from the Content-Language
// header instead (next.config.ts).
const DOCUMENT_LANG_SCRIPT =
  'document.documentElement.lang=location.pathname.startsWith("/et")?"et":"en"';

const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  weight: "400",
  subsets: ["latin", "latin-ext"],
});
// No italic face: the one italic on the site (a member quote) is left to the
// browser's own slant, which saves preloading two more font files on first
// paint — the bar already preloads one file per weight and subset.
const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  weight: ["400", "700"],
  subsets: ["latin", "latin-ext"],
});

// Re-render every page at most an hour after it goes stale.
//
// The pages are prerendered, and several of them depend on today's date: the
// album promotion is hidden from 1 January 2027 (lib/album.ts), and concerts
// retire into the archive the day after they happen (lib/concerts.ts). A page
// rendered once at build time would freeze "today" until the next deploy.
// Set here, on the root layout, because the lowest `revalidate` in a route
// applies to the whole route — so this covers every page under it.
export const revalidate = 3600;

// This must remain above the locale segment. If `[locale]/layout.tsx` owns the
// document shell, moving from `/et` to `/en` crosses a root-layout boundary
// and Next.js has to perform a full document navigation.
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const shopOn = await shopEnabled();
  const albumPromo = albumPromoActive(todayInTallinn());

  return (
    <html
      lang="et"
      // The script below may change `lang` before hydration, by design.
      suppressHydrationWarning
      className={`${archivoBlack.variable} ${spaceMono.variable}`}
      data-scroll-behavior="smooth"
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: DOCUMENT_LANG_SCRIPT }} />
      </head>
      <body>
        <AppShell shopOn={shopOn} albumPromo={albumPromo}>
          {children}
        </AppShell>
        <UmamiScript />
      </body>
    </html>
  );
}
