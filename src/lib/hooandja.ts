// The band's Hooandja crowdfunding campaign for "Rannapiigad", and how far it
// has got.
//
// Hooandja offers no public API for campaign figures (its robots.txt disallows
// /api/), but the public campaign page is server-rendered with them in plain
// text: "Kogutud 910 €", "Eesmärk kokku 2800 €", "Hooandjaid 15" … This turns
// that page into numbers.
//
// It reads the visible labels, not the markup. The page is styled with utility
// classes that change with any redesign; the Estonian labels change far less
// often. Anything it cannot find comes back undefined, and without the two
// figures a progress bar needs — collected and the total goal — the result is
// null, so the album section shows the Hooandja button without numbers rather
// than wrong ones.
//
// Pure and dependency-free so the tests drive it with a saved copy of the page;
// the fetch itself lives in hooandja-server.ts.

export const HOOANDJA_CAMPAIGN_URL =
  "https://www.hooandja.ee/campaigns/otekse-esimene-album-rannapiigad";
export const HOOANDJA_SUPPORTERS_URL = `${HOOANDJA_CAMPAIGN_URL}/view/supporters`;

export type CampaignProgress = {
  /** Pledged so far, in euros ("Kogutud"). */
  collectedEur: number;
  /** All goals together, in euros ("Eesmärk kokku"). */
  goalEur: number;
  /** The goal that decides whether the project is funded ("Peamine eesmärk"). */
  mainGoalEur?: number;
  /** As Hooandja reports it — of the main goal, not the total. */
  percent?: number;
  backers?: number;
  daysLeft?: number;
};

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&nbsp;": " ",
  "&quot;": '"',
  "&#x27;": "'",
  "&#39;": "'",
  "&lt;": "<",
  "&gt;": ">",
};

/** The page's visible text, one trimmed piece per element. */
function textTokens(html: string): string[] {
  return html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, "") // React splits "2800€" as 2800<!-- -->€
    .replace(/<[^>]+>/g, "\n")
    .replace(/&(?:amp|nbsp|quot|#x27|#39|lt|gt);/g, (e) => ENTITIES[e])
    .split("\n")
    .map((t) => t.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

/** "910 €", "2 800€", "1 234,50 €", "40%", "15" → a number; else undefined. */
export function parseFigure(text: string | undefined): number | undefined {
  if (text === undefined) return undefined;
  const m = text
    .replace(/[\s  ]/g, "")
    .match(/^(\d+(?:[.,]\d+)?)(?:€|%)?$/);
  return m ? Number(m[1].replace(",", ".")) : undefined;
}

/** The first figure printed right after `label` whose text ends with `unit`. */
function figureAfter(tokens: string[], label: string, unit = ""): number | undefined {
  for (let i = 0; i + 1 < tokens.length; i++) {
    if (tokens[i] === label && tokens[i + 1].endsWith(unit)) {
      const value = parseFigure(tokens[i + 1]);
      if (value !== undefined) return value;
    }
  }
  return undefined;
}

export function parseCampaignProgress(html: string): CampaignProgress | null {
  const tokens = textTokens(html);

  const collectedEur = figureAfter(tokens, "Kogutud", "€");
  const goalEur = figureAfter(tokens, "Eesmärk kokku", "€");
  if (collectedEur === undefined || goalEur === undefined || goalEur <= 0) {
    return null;
  }

  // "Peamine eesmärk 2300€" is a single piece of text in the goals list.
  const main = tokens.find((t) => t.startsWith("Peamine eesmärk"));
  const mainGoalEur = main
    ? parseFigure(main.slice("Peamine eesmärk".length))
    : undefined;

  return {
    collectedEur,
    goalEur,
    ...(mainGoalEur !== undefined ? { mainGoalEur } : {}),
    ...optional("percent", figureAfter(tokens, "Kogutud", "%")),
    ...optional("backers", figureAfter(tokens, "Hooandjaid")),
    ...optional("daysLeft", figureAfter(tokens, "Päevi lõpuni")),
  };
}

function optional<K extends string>(key: K, value: number | undefined) {
  return (value === undefined ? {} : { [key]: value }) as Partial<Record<K, number>>;
}
