# TASKS — frontend

Work top to bottom, one item at a time. Check items off as they're completed
(`[x]` done, `[~]` partial/in progress, `[ ]` not started).

- [x] Scaffold the Next.js app (TypeScript, App Router)
- [~] Organize AI-editable content under allowlist-friendly directories (`src/components`, `src/app/[locale]`); a dedicated `content/` dir still to add when marketing copy lands (`PROJECT_BRIEF.md` §10)
- [x] Set up i18n: Estonian default + English, locale auto-detection, manual switcher (next-intl)
- [x] Set up Orval + React Query: committed OpenAPI snapshot, generated client, hooks, and MSW mocks
- [x] Mock-data mode: `client-preview` builds run against the committed MSW mocks via `NEXT_PUBLIC_API_MOCKING` (`PROJECT_BRIEF.md` §10 "Preview data")
- [x] Design system from the Claude Design source: `:root` CSS-variable tokens + SCSS mixins + ui module, no CSS framework (see AGENTS.md "Styling")
- [x] Build the homepage from the Claude Design source: parallax hero, Meist, Liikmed selector, Kontserdid, E-pood teaser, footer
- [x] Real photos wired in (forest, wheat, band, girls cutout) via the `images:build` pipeline (originals in `assets-src/`, owner-provided)
- [x] Member photos for the Liikmed section (design's crops extracted from the export)
- [ ] "Hunt Aja Taga" music-player pill in the nav (deliberately skipped — needs the audio file from the owner)
- [~] Marketing pages: Meist/Kontserdid now live on the homepage per the design; separate about/contact pages only if the owner wants them
- [x] Product listing and product detail pages (restyled per the E-pood design)
- [ ] Display prices VAT-inclusive once Stripe Tax / VAT handling is wired (`PROJECT_BRIEF.md` §4)
- [x] Client-side cart (localStorage)
- [~] Checkout + order confirmation page: confirmation page done; checkout is a stub until `POST /checkout` + Stripe exist (`PROJECT_BRIEF.md` §5)
- [x] Starting-point privacy policy page — ET/EN text shipped and footer-linked; owner still arranges legal review, and it names `info@õtekse.ee`, which must actually exist (`PROJECT_BRIEF.md` §11)
- [x] Add the Umami tracking script to the root layout, pointed at the self-hosted instance (renders only when `NEXT_PUBLIC_UMAMI_URL` + `NEXT_PUBLIC_UMAMI_WEBSITE_ID` are set)
- [ ] CI pipeline per AGENTS.md "CI" (typecheck/lint/build/tests, MSW smoke check, Orval no-diff check)
- [x] Fill in AGENTS.md "Setup & commands" and "Conventions"
