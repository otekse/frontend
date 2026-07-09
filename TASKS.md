# TASKS — frontend

Work top to bottom, one item at a time. Check items off as they're completed
(`[x]` done, `[~]` partial/in progress, `[ ]` not started).

- [x] Scaffold the Next.js app (TypeScript, App Router)
- [~] Organize AI-editable content under allowlist-friendly directories (`src/components`, `src/app/[locale]`); a dedicated `content/` dir still to add when marketing copy lands (`PROJECT_BRIEF.md` §10)
- [x] Set up i18n: Estonian default + English, locale auto-detection, manual switcher (next-intl)
- [x] Set up Orval + React Query: committed OpenAPI snapshot, generated client, hooks, and MSW mocks
- [x] Mock-data mode: `client-preview` builds run against the committed MSW mocks via `NEXT_PUBLIC_API_MOCKING` (`PROJECT_BRIEF.md` §10 "Preview data")
- [ ] Build the homepage from the Claude Design source — **needs `/design-login`**; placeholder in place (see AGENTS.md "Design source")
- [ ] Marketing pages (about, contact — content to be confirmed with the owner)
- [x] Product listing and product detail pages
- [ ] Display prices VAT-inclusive once Stripe Tax / VAT handling is wired (`PROJECT_BRIEF.md` §4)
- [x] Client-side cart (localStorage)
- [~] Checkout + order confirmation page: confirmation page done; checkout is a stub until `POST /checkout` + Stripe exist (`PROJECT_BRIEF.md` §5)
- [ ] Starting-point privacy policy page (scaffolding only, owner arranges legal review — `PROJECT_BRIEF.md` §11)
- [ ] Add the Umami tracking script to the root layout, pointed at the self-hosted instance
- [ ] CI pipeline per AGENTS.md "CI" (typecheck/lint/build/tests, MSW smoke check, Orval no-diff check)
- [x] Fill in AGENTS.md "Setup & commands" and "Conventions"
