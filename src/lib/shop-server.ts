import { cookies } from "next/headers";
import {
  SHOP_COOKIE,
  SHOP_ENABLED,
  SHOP_PREVIEW_OVERRIDABLE,
  resolveShopEnabled,
} from "./shop";

/**
 * The effective storefront state for a server render.
 *
 * Kept out of `shop.ts` because that module is imported by `middleware.ts`,
 * which runs on the Edge runtime and cannot import `next/headers`.
 *
 * In production `SHOP_PREVIEW_OVERRIDABLE` is a compile-time `false`, so this
 * returns before ever touching `cookies()` — the call that would otherwise opt
 * every page out of static prerendering.
 */
export async function shopEnabled(): Promise<boolean> {
  if (!SHOP_PREVIEW_OVERRIDABLE) return SHOP_ENABLED;
  return resolveShopEnabled((await cookies()).get(SHOP_COOKIE)?.value);
}
