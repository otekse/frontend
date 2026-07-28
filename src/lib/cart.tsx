"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { SHOP_ENABLED } from "./shop";

// Client-side only cart (localStorage). No server-side cart table — v1 keeps
// the cart entirely in the browser (PROJECT_BRIEF.md §4). Prices here are for
// display only; the server always re-validates at checkout.
export type CartItem = {
  id: string;
  name: string;
  priceCents: number;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  setQuantity: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  totalCents: number;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "otekse.cart.v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // One-time hydration from localStorage. Must run in an effect (not a lazy
  // initializer) so server and first client render both start from [] and
  // avoid a hydration mismatch; the setState-in-effect is intentional here.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      // ignore malformed storage
    }
    setHydrated(true);
  }, []);

  // Never write storage while the storefront is off. Without this the provider
  // persists an empty cart on the marketing-only site, putting a key on the
  // visitor's device for a feature that is switched off — and contradicting
  // the privacy policy, which states the locale cookie is the only thing we
  // store. Reading above stays unconditional so an existing cart survives the
  // shop being toggled back on.
  useEffect(() => {
    if (hydrated && SHOP_ENABLED) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, hydrated]);

  const add = useCallback((item: Omit<CartItem, "quantity">, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + qty } : i,
        );
      }
      return [...prev, { ...item, quantity: qty }];
    });
  }, []);

  const setQuantity = useCallback((id: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.id !== id)
        : prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i)),
    );
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const totalCents = items.reduce((s, i) => s + i.priceCents * i.quantity, 0);
    const count = items.reduce((s, i) => s + i.quantity, 0);
    return { items, add, setQuantity, remove, clear, totalCents, count };
  }, [items, add, setQuantity, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
