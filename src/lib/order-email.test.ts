import { describe, it } from "node:test";
import assert from "node:assert/strict";
// Explicit .ts extension: Node's ESM resolver does not do extension guessing.
import { orderEmailBody, orderMailto } from "./order-email.ts";

const labels = {
  intro: "Tere! Soovin tellida:",
  total: "Kokku",
  name: "Nimi",
  phone: "Telefon",
  delivery: "Kättesaamine",
  notes: "Lisainfo",
};
const eur = (cents: number) => `${(cents / 100).toFixed(2)} €`;

describe("orderEmailBody", () => {
  it("lists each item with its line total, then the total and blanks to fill", () => {
    const body = orderEmailBody(
      [
        { name: "T-särk „Õtekse“", quantity: 2, priceCents: 2500 },
        { name: "Rätik", quantity: 1, priceCents: 1800 },
      ],
      labels,
      eur,
    );
    assert.equal(
      body,
      [
        "Tere! Soovin tellida:",
        "",
        "2 × T-särk „Õtekse“ — 50.00 €",
        "1 × Rätik — 18.00 €",
        "",
        "Kokku: 68.00 €",
        "",
        "Nimi: ",
        "Telefon: ",
        "Kättesaamine: ",
        "Lisainfo: ",
      ].join("\n"),
    );
  });
});

describe("orderMailto", () => {
  it("addresses the band and percent-encodes the subject", () => {
    assert.equal(
      orderMailto("otekse@gmail.com", "Tellimus — Õtekse", "x"),
      "mailto:otekse@gmail.com?subject=Tellimus%20%E2%80%94%20%C3%95tekse&body=x",
    );
  });

  it("encodes line breaks as CRLF and keeps an ampersand inside the body", () => {
    const href = orderMailto("a@b.ee", "S", "1 × Särk & müts\nKokku: 5 €");
    assert.ok(
      href.endsWith(
        "&body=1%20%C3%97%20S%C3%A4rk%20%26%20m%C3%BCts%0D%0AKokku%3A%205%20%E2%82%AC",
      ),
    );
    const body = new URL(href).searchParams.get("body");
    assert.equal(body, "1 × Särk & müts\r\nKokku: 5 €");
  });
});
