import { NextResponse, type NextRequest } from "next/server";
import { resolveLocale } from "@/i18n/resolve-locale";
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE } from "@/i18n/locale-cookie";
import { clientIpFrom, countryForIp } from "@/lib/geoip";

// The GeoIP reader needs filesystem access, which the Edge runtime does not
// provide. A route handler gives us a stable Node runtime without relying on
// Next 16's still-experimental `nodeMiddleware`.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const next = sanitiseNext(request.nextUrl.searchParams.get("next"));
  const ip = clientIpFrom(request.headers.get("x-forwarded-for"));
  const locale = resolveLocale(
    await countryForIp(ip),
    request.headers.get("accept-language"),
  );

  // A relative Location on purpose. Behind Traefik, `request.nextUrl.origin`
  // resolves to the container's own bind address, so building an absolute URL
  // here sent real visitors to https://localhost:3000/et. The target is always
  // same-origin, and RFC 7231 permits a relative Location, so sidestep host
  // detection entirely rather than trying to reconstruct it from forwarded
  // headers.
  const response = new NextResponse(null, {
    status: 307,
    headers: { Location: `/${locale}${next}` },
  });

  // Remember the outcome so this costs one redirect per visitor, not per request.
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: "lax",
  });

  return response;
}

// Only ever redirect to a path on this origin. Without this, a crafted
// ?next=//evil.example would turn the site into an open redirect.
function sanitiseNext(value: string | null): string {
  if (!value || value === "/") return "";
  if (!value.startsWith("/") || value.startsWith("//")) return "";
  return value;
}
