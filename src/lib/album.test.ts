import { describe, it } from "node:test";
import assert from "node:assert/strict";
// Explicit .ts extension: Node's ESM resolver does not do extension guessing.
import { ALBUM_PROMO_ENDS, albumPromoActive } from "./album.ts";

describe("albumPromoActive", () => {
  it("ends in January 2027", () => {
    assert.equal(ALBUM_PROMO_ENDS, "2027-01-01");
  });

  it("shows the promotion through New Year's Eve", () => {
    assert.equal(albumPromoActive("2026-09-13"), true);
    assert.equal(albumPromoActive("2026-12-31"), true);
  });

  it("hides it from New Year's Day on", () => {
    assert.equal(albumPromoActive("2027-01-01"), false);
    assert.equal(albumPromoActive("2027-06-15"), false);
  });
});
