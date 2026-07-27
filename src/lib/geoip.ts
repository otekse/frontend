import path from "node:path";
import { open, type CountryResponse, type Reader } from "maxmind";

const DB_PATH = path.join(process.cwd(), "geoip", "dbip-country-lite.mmdb");

// The reader is opened once and reused across requests.
let readerPromise: Promise<Reader<CountryResponse> | null> | null = null;

function getReader() {
  readerPromise ??= open<CountryResponse>(DB_PATH).catch((error: unknown) => {
    console.warn(`[geoip] database unavailable at ${DB_PATH}:`, error);
    return null;
  });
  return readerPromise;
}

// ISO country code for an IP, or null when it cannot be determined.
//
// Fails soft by design: a missing, stale, or corrupt database must cost locale
// precision, never break the request.
export async function countryForIp(ip: string | null): Promise<string | null> {
  if (!ip) return null;

  const reader = await getReader();
  if (!reader) return null;

  try {
    return reader.get(ip)?.country?.iso_code ?? null;
  } catch {
    return null; // malformed address
  }
}

// The client address from X-Forwarded-For.
//
// Measured against production 2026-07-28: our Traefik *replaces* this header
// with the real peer address rather than trusting the client's, so a forged
// value never reaches us. Do not rely on that anyway — it is proxy
// configuration, not a guarantee, and a future change could silently restore
// client control. Treat the value as untrusted: it is fine for choosing a
// default language, where the worst case is a visitor picking their own (the
// locale switcher already allows that), and must never be used for
// authentication, authorisation, rate limiting, or audit logging.
export function clientIpFrom(forwardedFor: string | null): string | null {
  if (!forwardedFor) return null;
  return forwardedFor.split(",")[0]?.trim() || null;
}
