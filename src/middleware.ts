import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { SHOP_ENABLED } from "./lib/shop";

const intlMiddleware = createMiddleware(routing);

// Storefront surfaces, matched after the locale prefix is stripped.
const STOREFRONT = /^\/(shop|cart|checkout|order)(\/|$)/;

// Blocking the storefront here rather than with notFound() inside the pages is
// deliberate: those pages are client components, and notFound() called from a
// client component renders the not-found UI but leaves the status at 200 — a
// soft 404 that crawlers treat as a real page. Rewriting to a path that
// matches no route produces a genuine 404 and skips rendering entirely.
function withoutLocale(pathname: string): string {
  for (const locale of routing.locales) {
    if (pathname === `/${locale}`) return "/";
    if (pathname.startsWith(`/${locale}/`)) return pathname.slice(locale.length + 1);
  }
  return pathname;
}

export default function middleware(request: NextRequest) {
  if (!SHOP_ENABLED && STOREFRONT.test(withoutLocale(request.nextUrl.pathname))) {
    return NextResponse.rewrite(new URL("/shop-disabled-404", request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  // Run on everything except API routes, Next internals, and files with an
  // extension (static assets, mockServiceWorker.js, etc.).
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
