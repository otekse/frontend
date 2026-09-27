import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
// Explicit .ts extension: Node's ESM resolver does not do extension guessing.
import { parseCampaignProgress, parseFigure } from "./hooandja.ts";

const here = dirname(fileURLToPath(import.meta.url));
// A trimmed copy of the real campaign page (see the comment inside it).
const page = readFileSync(join(here, "__fixtures__", "hooandja-campaign.html"), "utf8");

describe("parseCampaignProgress", () => {
  it("reads every figure from the real campaign page", () => {
    assert.deepEqual(parseCampaignProgress(page), {
      collectedEur: 910,
      goalEur: 2800,
      mainGoalEur: 2300,
      percent: 40,
      backers: 15,
      daysLeft: 33,
    });
  });

  it("gives up without the two figures a progress bar needs", () => {
    assert.equal(parseCampaignProgress("<html><body>Hooldustööd</body></html>"), null);
    assert.equal(
      parseCampaignProgress("<span>Kogutud </span><span>910 €</span>"),
      null,
    );
  });

  it("leaves out figures the page no longer shows, keeping the rest", () => {
    const ended = page.replace(/Päevi lõpuni/g, "Kampaania lõppes");
    const progress = parseCampaignProgress(ended);
    assert.ok(progress);
    assert.equal(progress.daysLeft, undefined);
    assert.equal(progress.collectedEur, 910);
  });

  it("does not mistake the percentage for the amount collected", () => {
    // "Kogutud" labels both "910 €" and "40%"; order on the page must not matter.
    const html =
      "<span>Kogutud</span><span>40%</span><span>Kogutud</span><span>1 234 €</span>" +
      "<span>Eesmärk kokku</span><span>5 000<!-- -->€</span>";
    assert.deepEqual(parseCampaignProgress(html), {
      collectedEur: 1234,
      goalEur: 5000,
      percent: 40,
    });
  });
});

describe("parseFigure", () => {
  it("reads euros, percentages and counts in Hooandja's formats", () => {
    assert.equal(parseFigure("910 €"), 910);
    assert.equal(parseFigure("2800€"), 2800);
    assert.equal(parseFigure("2 800 €"), 2800);
    assert.equal(parseFigure("1 234,50 €"), 1234.5);
    assert.equal(parseFigure("40%"), 40);
    assert.equal(parseFigure("15"), 15);
  });

  it("rejects anything that is not a figure", () => {
    assert.equal(parseFigure("Anna hoogu"), undefined);
    assert.equal(parseFigure(""), undefined);
    assert.equal(parseFigure(undefined), undefined);
  });
});
