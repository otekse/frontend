// /llms.txt (https://llmstxt.org): a plain Markdown summary of the site for AI
// assistants and AI search, which often read it instead of rendering pages.
//
// Pure: everything it describes comes in as arguments or from the identity
// modules, so the text is built from the same sources as the site and cannot
// drift from it. Concert dates are left out on purpose — the route is static,
// and a list frozen at build would go stale; it links the concerts page instead.

import { CONTACT_EMAIL, SOCIAL_LINKS } from "./contact.ts";
import { SITE_NAME, SITE_URL } from "./site.ts";

export function buildLlmsTxt({
  summary,
  about,
  aboutEnabled,
  shopEnabled,
}: {
  /** One line on who the band is (the English meta description). */
  summary: string;
  /** The band's own introduction, one string per paragraph. */
  about: string[];
  aboutEnabled: boolean;
  shopEnabled: boolean;
}): string {
  const pages: [title: string, path: string, note: string][] = [
    ["Home", "", "who we are, our music, the album “Rannapiigad”"],
    ["Concerts", "/concerts", "upcoming and past concerts"],
    ...(aboutEnabled
      ? [["About", "/about", "our timeline, year by year"] as [string, string, string]]
      : []),
    ...(shopEnabled
      ? [["Shop", "/shop", "merch and records"] as [string, string, string]]
      : []),
  ];

  const lines = [
    `# ${SITE_NAME}`,
    "",
    `> ${summary}`,
    "",
    about.join("\n\n"),
    "",
    "Genre: folk, Estonian folk music (eesti folk), pärimusmuusika, rahvamuusika.",
    "",
    "## Pages",
    "",
    ...pages.map(
      ([title, path, note]) =>
        `- [${title}](${SITE_URL}/en${path}): ${note} ([eesti keeles](${SITE_URL}/et${path}))`,
    ),
    "",
    "## Elsewhere",
    "",
    ...SOCIAL_LINKS.map(({ name, url }) => `- [${name}](${url})`),
    "",
    "## Contact",
    "",
    `- ${CONTACT_EMAIL}`,
  ];

  return lines.join("\n") + "\n";
}
