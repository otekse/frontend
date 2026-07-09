# TASKS — frontend

Work top to bottom, one item at a time. Check items off as they're completed.

- [ ] Scaffold the Next.js app (TypeScript, App Router)
- [ ] Organize AI-editable content under allowlist-friendly directories (e.g. `src/components`, `content/`) so the orchestrator's path allowlist maps cleanly onto the repo layout (`PROJECT_BRIEF.md` §10)
- [ ] Set up i18n: Estonian default + English, locale auto-detection, manual switcher
- [ ] Set up Orval + React Query: commit the OpenAPI spec snapshot, generated client, hooks, and MSW mocks (see AGENTS.md "API client")
- [ ] Mock-data mode: `client-preview` builds run against the committed MSW mocks, never the real API (`PROJECT_BRIEF.md` §10 "Preview data")
- [ ] Build the homepage from the Claude Design source (see AGENTS.md "Design source")
- [ ] Marketing pages (about, contact — content to be confirmed with the owner)
- [ ] Product listing and product detail pages (prices displayed VAT-inclusive, `PROJECT_BRIEF.md` §4)
- [ ] Client-side cart (React state / localStorage)
- [ ] Checkout redirect flow + order confirmation page (informational only — payment truth comes from the backend webhook, never this page, `PROJECT_BRIEF.md` §5)
- [ ] Starting-point privacy policy page (scaffolding only, owner arranges legal review — `PROJECT_BRIEF.md` §11)
- [ ] Add the Umami tracking script to the root layout, pointed at the self-hosted instance
- [ ] CI pipeline per AGENTS.md "CI" (typecheck/lint/build/tests, MSW smoke check, Orval no-diff check)
- [ ] Fill in AGENTS.md "Setup & commands" and "Conventions"
