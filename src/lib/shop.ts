import { notFound } from "next/navigation";

// The storefront stays dark until Stripe and real products exist (see the
// public-launch design). Default ON so dev and the AI-editable preview keep
// exercising the shop; only production sets NEXT_PUBLIC_SHOP_ENABLED=false.
export const SHOP_ENABLED = process.env.NEXT_PUBLIC_SHOP_ENABLED !== "false";

// Backstop only — the real guard is in middleware.ts.
//
// Storefront pages are client components, and notFound() called from a client
// component renders the not-found UI but leaves the HTTP status at 200. That
// soft 404 is worse than useless for crawlers, so the middleware blocks these
// paths before they ever render. This stays as a second line of defence in
// case the middleware matcher is narrowed later: the visitor would still not
// see shop content, just with the wrong status code.
export function assertShopEnabled(): void {
  if (!SHOP_ENABLED) notFound();
}
