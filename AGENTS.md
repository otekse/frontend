# AGENTS.md — frontend

Next.js (React) storefront and marketing site. See the workspace-level
[`AGENTS.md`](../workspace/AGENTS.md) and [`PROJECT_BRIEF.md`](../workspace/PROJECT_BRIEF.md)
for full system context; this file covers what's specific to this repo.

## What this repo is

Homepage, marketing pages, product listing/detail pages, cart, checkout
redirect, order confirmation page. Talks to `backend` only over HTTP
(`GET /products`, `POST /checkout`, etc.) via a typed client generated with
**Orval** from the backend's OpenAPI spec, using **React Query**.

## Design source

The visual design for this site lives in a Claude Design project — treat it
as the source of truth for look and feel:

- **Project:** [Õtekse koduleht](https://claude.ai/design/p/2639bd2d-cb50-45b9-809e-3606cae0002d?file=%C3%95tekse+koduleht.dc.html) (file: `Õtekse koduleht.dc.html`)
- **Programmatic access for agents:** the `claude_design` MCP server, configured
  in this repo's `.mcp.json` (endpoint: `https://api.anthropic.com/v1/design/mcp`).
  In Claude Code, authorize once per machine with `/design-login`; any other
  MCP-capable agent authenticates against the same endpoint.

When building or changing UI, match that design rather than inventing styling.
If the design doesn't cover something you need, flag it to the owner instead
of guessing.

## This is the only AI-editable repo

This is the sole repo the client-facing AI orchestrator (`PROJECT_BRIEF.md`
§10) ever has write access to — its scoped GitHub App is installed here and
nowhere else. That makes the guardrails below load-bearing, not stylistic:

- **Contains NO secrets, NO database access, NO admin code, NO Stripe keys.**
- The orchestrator's `commit_and_push` tool is hardcoded to push to the
  **`client-preview`** branch only — never `main`.
- The orchestrator's `edit_file`/`read_file` tools are restricted to an
  allowlist of directories (e.g. `src/components`, `content/`) enforced in
  the orchestrator's own code. Config files (`next.config.js`, CI workflows,
  env handling) are off-limits even if asked.
- `client-preview` reads **mock data only** (Orval/MSW mock server off the
  OpenAPI spec) — never real stock/prices/orders.

These rules constrain the *runtime* orchestrator. As a human-directed coding
agent building this repo, you are not bound by the file allowlist — but do
not weaken or remove the guardrails above without the owner's explicit
sign-off, since they're the point of the project.

## Deploys

- `main` → `example.com` (production)
- `client-preview` → `preview.example.com` (AI edits land here first)

## Setup & commands

_TODO: fill in once the Next.js app is scaffolded (install, dev, build, lint, test)._

## Conventions

_TODO: component structure, styling approach, naming conventions._
