import { notFound } from "next/navigation";

// The storefront stays dark until Stripe and real products exist (see the
// public-launch design). Default ON so dev and the AI-editable preview keep
// exercising the shop; only production sets NEXT_PUBLIC_SHOP_ENABLED=false.
export const SHOP_ENABLED = process.env.NEXT_PUBLIC_SHOP_ENABLED !== "false";

/**
 * Preview-only override, so the editor can show both storefront states without
 * a rebuild. Deliberately gated on the mocking flag, which is set only on the
 * `client-preview` build: in production this is a compile-time `false`, the
 * cookie is never read, and the pages stay statically prerendered.
 *
 * This override can never open the real shop — production's storefront state
 * stays a deploy-time decision (NEXT_PUBLIC_SHOP_ENABLED in Coolify).
 */
export const SHOP_PREVIEW_OVERRIDABLE =
  process.env.NEXT_PUBLIC_API_MOCKING === "enabled";

export const SHOP_COOKIE = "otk_shop";

/** Resolve the effective state from an override cookie value. Pure — the
 *  cookie is read by the caller (server component, or middleware on the edge). */
export function resolveShopEnabled(cookieValue: string | undefined): boolean {
  if (!SHOP_PREVIEW_OVERRIDABLE) return SHOP_ENABLED;
  if (cookieValue === "on") return true;
  if (cookieValue === "off") return false;
  return SHOP_ENABLED;
}

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
