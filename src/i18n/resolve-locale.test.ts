import { describe, it } from "node:test";
import assert from "node:assert/strict";
// Explicit .ts extension: Node's ESM resolver does not do extension guessing.
import { resolveLocale } from "./resolve-locale.ts";

// Node's built-in test runner, deliberately: it needs no dependencies. vitest
// pulls in vite, whose esbuild requirement conflicts with orval's, and npm
// resolves that conflict inconsistently enough to break `npm ci` in a clean
// Linux container while passing on a developer machine.
describe("resolveLocale", () => {
  it("gives Estonian to a visitor in Estonia whatever their browser prefers", () => {
    assert.equal(resolveLocale("EE", "en-US,en;q=0.9"), "et");
  });

  it("gives Estonian to an Estonian-preferring browser outside Estonia", () => {
    assert.equal(resolveLocale("FI", "et-EE,et;q=0.9,en;q=0.8"), "et");
  });

  it("gives English to a visitor neither in Estonia nor asking for Estonian", () => {
    assert.equal(resolveLocale("DE", "de-DE,de;q=0.9,en;q=0.8"), "en");
  });

  it("falls back to Accept-Language when geo is unavailable", () => {
    assert.equal(resolveLocale(null, "et"), "et");
    assert.equal(resolveLocale(null, "fr-FR,fr;q=0.9"), "en");
  });

  it("defaults to English when there is no signal at all", () => {
    assert.equal(resolveLocale(null, null), "en");
    assert.equal(resolveLocale(undefined, undefined), "en");
  });

  it("accepts a lowercase country code", () => {
    assert.equal(resolveLocale("ee", null), "et");
  });

  it("ignores Estonian offered at q=0", () => {
    assert.equal(resolveLocale(null, "en;q=0.9,et;q=0"), "en");
  });

  it("does not match a language tag that merely starts with the letters 'et'", () => {
    assert.equal(resolveLocale(null, "eth,en;q=0.5"), "en");
  });
});
