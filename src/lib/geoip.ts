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
// SPOOFABLE: Traefik appends to any client-supplied header, so the first entry
// is under the client's control. That is acceptable here and only here — the
// worst outcome is a visitor forcing their own default language, which the
// locale switcher already lets them do. Never use this value for
// authentication, authorisation, rate limiting, or audit logging.
export function clientIpFrom(forwardedFor: string | null): string | null {
  if (!forwardedFor) return null;
  return forwardedFor.split(",")[0]?.trim() || null;
}
