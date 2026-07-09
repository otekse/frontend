// Formats integer minor units (cents) as a localized currency string.
export function formatPrice(cents: number, locale: string, currency = "EUR"): string {
  const intlLocale = locale === "et" ? "et-EE" : "en-GB";
  return new Intl.NumberFormat(intlLocale, { style: "currency", currency }).format(
    cents / 100,
  );
}
