import type { Locale } from "./routing";

const ESTONIA = "EE";

// Decides the language for a visitor who has not chosen one yet.
//
// Precedence: physically in Estonia -> Estonian; otherwise an Estonian-
// preferring browser -> Estonian; otherwise English. Geo alone would strand
// Estonians abroad on English, and Accept-Language alone would ignore the
// "visitors from Estonia" requirement, so both signals are used in that order.
//
// Pure by design — no I/O and no request object — so it is directly testable.
export function resolveLocale(
  country: string | null | undefined,
  acceptLanguage: string | null | undefined,
): Locale {
  if (country?.toUpperCase() === ESTONIA) return "et";
  return prefersEstonian(acceptLanguage) ? "et" : "en";
}

// True when the header lists an Estonian tag with a non-zero quality value.
function prefersEstonian(acceptLanguage: string | null | undefined): boolean {
  if (!acceptLanguage) return false;

  return acceptLanguage.split(",").some((part) => {
    const [rawTag, ...params] = part.trim().split(";");
    const tag = rawTag.trim().toLowerCase();
    if (tag !== "et" && !tag.startsWith("et-")) return false;

    const quality = params.find((p) => p.trim().startsWith("q="));
    return quality ? Number.parseFloat(quality.split("=")[1]) > 0 : true;
  });
}
