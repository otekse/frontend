import { describe, expect, it } from "vitest";
import { resolveLocale } from "./resolve-locale";

describe("resolveLocale", () => {
  it("gives Estonian to a visitor in Estonia whatever their browser prefers", () => {
    expect(resolveLocale("EE", "en-US,en;q=0.9")).toBe("et");
  });

  it("gives Estonian to an Estonian-preferring browser outside Estonia", () => {
    expect(resolveLocale("FI", "et-EE,et;q=0.9,en;q=0.8")).toBe("et");
  });

  it("gives English to a visitor neither in Estonia nor asking for Estonian", () => {
    expect(resolveLocale("DE", "de-DE,de;q=0.9,en;q=0.8")).toBe("en");
  });

  it("falls back to Accept-Language when geo is unavailable", () => {
    expect(resolveLocale(null, "et")).toBe("et");
    expect(resolveLocale(null, "fr-FR,fr;q=0.9")).toBe("en");
  });

  it("defaults to English when there is no signal at all", () => {
    expect(resolveLocale(null, null)).toBe("en");
    expect(resolveLocale(undefined, undefined)).toBe("en");
  });

  it("accepts a lowercase country code", () => {
    expect(resolveLocale("ee", null)).toBe("et");
  });

  it("ignores Estonian offered at q=0", () => {
    expect(resolveLocale(null, "en;q=0.9,et;q=0")).toBe("en");
  });

  it("does not match a language tag that merely starts with the letters 'et'", () => {
    expect(resolveLocale(null, "eth,en;q=0.5")).toBe("en");
  });
});
