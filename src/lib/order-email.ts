// The order email the cart sends.
//
// The shop takes no payment. An order is an email to the band, written out
// from the cart, which the customer completes (name, phone, delivery) and
// sends from their own mail app; the band replies to arrange payment and
// delivery. Nothing is charged, stored or sent by the site itself.
//
// Pure and dependency-free so the tests drive it: the caller passes the
// translated labels and a price formatter.

export type OrderLine = { name: string; quantity: number; priceCents: number };

export type OrderEmailLabels = {
  intro: string;
  total: string;
  name: string;
  phone: string;
  delivery: string;
  notes: string;
};

/**
 * The email text: a greeting, one line per item with its line total, the
 * order total, then labelled blanks for the customer to fill in.
 */
export function orderEmailBody(
  lines: OrderLine[],
  labels: OrderEmailLabels,
  formatPrice: (cents: number) => string,
): string {
  const total = lines.reduce((sum, l) => sum + l.priceCents * l.quantity, 0);
  return [
    labels.intro,
    "",
    ...lines.map(
      (l) => `${l.quantity} × ${l.name} — ${formatPrice(l.priceCents * l.quantity)}`,
    ),
    "",
    `${labels.total}: ${formatPrice(total)}`,
    "",
    `${labels.name}: `,
    `${labels.phone}: `,
    `${labels.delivery}: `,
    `${labels.notes}: `,
  ].join("\n");
}

/**
 * A `mailto:` link that opens the customer's mail app with the order filled
 * in. Subject and body are percent-encoded (so an "&" in a product name cannot
 * end the body early), and line breaks are CRLF, as RFC 6068 asks.
 */
export function orderMailto(to: string, subject: string, body: string): string {
  const encodedBody = encodeURIComponent(body.replace(/\r?\n/g, "\r\n"));
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodedBody}`;
}
