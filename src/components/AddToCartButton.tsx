"use client";

import { useTranslations } from "next-intl";
import { useCart } from "@/lib/cart";
import type { ProductResponseDto } from "@/api/generated/model";

export function AddToCartButton({ product }: { product: ProductResponseDto }) {
  const t = useTranslations("Product");
  const { add } = useCart();
  const soldOut = product.stock <= 0;

  return (
    <button
      type="button"
      disabled={soldOut}
      onClick={() =>
        add({ id: product.id, name: product.name, priceCents: product.priceCents })
      }
      className="rounded bg-foreground px-4 py-2 text-sm font-medium text-background disabled:cursor-not-allowed disabled:opacity-40"
    >
      {soldOut ? t("outOfStock") : t("addToCart")}
    </button>
  );
}
