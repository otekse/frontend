import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { SOCIAL_LINKS } from "./contact.ts";
import { buildLlmsTxt } from "./llms-txt.ts";

const input = (over: Partial<Parameters<typeof buildLlmsTxt>[0]> = {}) => ({
  summary: "An Estonian folk band.",
  about: ["First paragraph.", "Second paragraph."],
  aboutEnabled: true,
  shopEnabled: false,
  ...over,
});

describe("buildLlmsTxt", () => {
  it("follows the llms.txt shape: title, summary quote, then sections", () => {
    const out = buildLlmsTxt(input());
    assert.ok(out.startsWith("# Õtekse\n\n> An Estonian folk band.\n\n"));
    assert.ok(out.includes("First paragraph.\n\nSecond paragraph."));
    assert.ok(out.endsWith("\n"));
  });

  it("links both languages of every live page", () => {
    const out = buildLlmsTxt(input());
    for (const path of ["/en", "/et", "/en/concerts", "/et/concerts", "/en/about"]) {
      assert.ok(out.includes(`(https://xn--tekse-cua.ee${path})`), path);
    }
  });

  it("never lists a page whose flag is off", () => {
    const out = buildLlmsTxt(input({ aboutEnabled: false, shopEnabled: false }));
    assert.equal(out.includes("/about"), false);
    assert.equal(out.includes("/shop"), false);
    assert.ok(buildLlmsTxt(input({ shopEnabled: true })).includes("/en/shop"));
  });

  it("lists the band's profiles elsewhere", () => {
    const out = buildLlmsTxt(input());
    for (const { name, url } of SOCIAL_LINKS) {
      assert.ok(out.includes(`- [${name}](${url})`), name);
    }
  });
});
