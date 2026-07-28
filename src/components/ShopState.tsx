"use client";

import { createContext, useContext } from "react";
import { SHOP_ENABLED } from "@/lib/shop";

// Carries the server-resolved storefront state to client components.
//
// Client components cannot read cookies during render, so the layout resolves
// the state once on the server (build default, or the preview override) and
// publishes it here. Defaults to the build-time constant so any component used
// outside the provider still behaves correctly.
const ShopStateContext = createContext<boolean>(SHOP_ENABLED);

export function ShopStateProvider({
  enabled,
  children,
}: {
  enabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <ShopStateContext.Provider value={enabled}>
      {children}
    </ShopStateContext.Provider>
  );
}

export function useShopEnabled(): boolean {
  return useContext(ShopStateContext);
}
