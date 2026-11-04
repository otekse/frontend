import { describe, it } from "node:test";
import assert from "node:assert/strict";
// Explicit .ts extension: Node's ESM resolver does not do extension guessing.
import { ALBUM_PROMO_ENDS, albumPromoActive } from "./album.ts";

describe("albumPromoActive", () => {
  it("ended on 4 November 2026", () => {
    assert.equal(ALBUM_PROMO_ENDS, "2026-11-04");
  });

  it("shows the promotion up to the day before", () => {
    assert.equal(albumPromoActive("2026-09-13"), true);
    assert.equal(albumPromoActive("2026-11-03"), true);
  });

  it("hides it from the end date on", () => {
    assert.equal(albumPromoActive("2026-11-04"), false);
    assert.equal(albumPromoActive("2027-06-15"), false);
  });
});
