"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import type { ProductResponseDto } from "@/api/generated/model";
import styles from "./ProductCard.module.scss";

export function ProductCard({ product }: { product: ProductResponseDto }) {
  const t = useTranslations("Shop");
  const locale = useLocale();
  const { add } = useCart();
  const soldOut = product.stock <= 0;

  return (
    <div className={styles.card}>
      <div className={styles.imageArea}>
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.name} />
        ) : null}
        {soldOut && <div className={styles.tag}>{t("outOfStock")}</div>}
      </div>
      <div className={styles.body}>
        <h3 className={styles.name}>
          <Link href={`/shop/${product.id}`}>{product.name}</Link>
        </h3>
        {product.description && (
          <div className={styles.desc}>{product.description}</div>
        )}
        <div className={styles.priceRow}>
          <div className={styles.price}>
            {formatPrice(product.priceCents, locale, product.currency.toUpperCase())}
          </div>
          <button
            type="button"
            className={styles.addBtn}
            disabled={soldOut}
            onClick={() =>
              add({
                id: product.id,
                name: product.name,
                priceCents: product.priceCents,
              })
            }
          >
            {t("addToCart")}
          </button>
        </div>
      </div>
    </div>
  );
}
