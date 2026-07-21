"use client";

import { useTranslations } from "next-intl";
import { useCart } from "@/lib/cart";
import type { ProductResponseDto } from "@/api/generated/model";
import ui from "@/styles/ui.module.scss";

export function AddToCartButton({ product }: { product: ProductResponseDto }) {
  const t = useTranslations("Product");
  const { add } = useCart();
  const soldOut = product.stock <= 0;

  return (
    <button
      type="button"
      disabled={soldOut}
      className={ui.pillDark}
      onClick={() =>
        add({ id: product.id, name: product.name, priceCents: product.priceCents })
      }
    >
      {soldOut ? t("outOfStock") : t("addToCart")}
    </button>
  );
}
