import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { LOCALE_COOKIE } from "./i18n/locale-cookie";
import { SHOP_COOKIE, resolveShopEnabled } from "./lib/shop";

const intlMiddleware = createMiddleware(routing);

// Storefront surfaces, matched after the locale prefix is stripped.
const STOREFRONT = /^\/(shop|cart|checkout|order)(\/|$)/;

// Crawlers get a stable, geo-independent locale — indexing must not depend on
// which country a bot happens to crawl from.
const CRAWLER =
  /bot|crawler|spider|crawling|slurp|mediapartners|facebookexternalhit/i;

function stripLocale(pathname: string): string {
  for (const locale of routing.locales) {
    if (pathname === `/${locale}`) return "/";
    if (pathname.startsWith(`/${locale}/`)) return pathname.slice(locale.length + 1);
  }
  return pathname;
}

function hasLocalePrefix(pathname: string): boolean {
  return routing.locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
}

export default function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Blocking the storefront here rather than with notFound() inside the pages
  // is deliberate: those pages are client components, and notFound() called
  // from a client component renders the not-found UI but leaves the status at
  // 200 — a soft 404 that crawlers treat as a real page. Rewriting to a path
  // that matches no route produces a genuine 404 and skips rendering entirely.
  const shopOn = resolveShopEnabled(request.cookies.get(SHOP_COOKIE)?.value);
  if (!shopOn && STOREFRONT.test(stripLocale(pathname))) {
    return NextResponse.rewrite(new URL("/shop-disabled-404", request.url));
  }

  // Already locale-prefixed — next-intl serves it unchanged.
  if (hasLocalePrefix(pathname)) return intlMiddleware(request);

  const remembered = request.cookies.get(LOCALE_COOKIE)?.value;
  const isKnown = routing.locales.some((locale) => locale === remembered);
  const isCrawler = CRAWLER.test(request.headers.get("user-agent") ?? "");

  // A remembered manual choice always wins. We read the cookie here rather than
  // delegating because `localeDetection: false` also stops next-intl from
  // reading it.
  if (isKnown || isCrawler) {
    const locale = isKnown ? remembered : routing.defaultLocale;
    const path = pathname === "/" ? "" : pathname;
    return NextResponse.redirect(new URL(`/${locale}${path}${search}`, request.url));
  }

  // First-time visitor: resolve the country in the Node route handler.
  const url = new URL("/api/locale", request.url);
  url.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(url);
}

export const config = {
  // Everything except API routes (which includes /api/locale, so there is no
  // redirect loop), Next internals, and files with an extension — the latter
  // also keeps /sitemap.xml and /robots.txt out of the locale machinery.
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
