"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useProductsControllerFindOne } from "@/api/generated/products/products";
import { AddToCartButton } from "@/components/AddToCartButton";
import { SmartImage } from "@/components/SmartImage";
import { formatPrice } from "@/lib/format";
import ui from "@/styles/ui.module.scss";
import styles from "./page.module.scss";

export default function ProductDetailPage() {
  const t = useTranslations("Product");
  const locale = useLocale();
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, isError } = useProductsControllerFindOne(id);

  return (
    <div className={ui.page}>
      <div className={ui.pageInner}>
        <Link href="/shop" className={ui.inkLink}>
          ← {t("backToShop")}
        </Link>

        {isLoading && <p className={styles.status}>…</p>}
        {isError && <p className={styles.statusError}>{t("notFound")}</p>}

        {product && (
          <div className={styles.layout}>
            <div className={`${ui.card} ${styles.imageFrame}`}>
              <SmartImage src={product.imageUrl} alt={product.name} />
            </div>
            <div>
              <h1 className={styles.title}>{product.name}</h1>
              <p className={styles.price}>
                {formatPrice(product.priceCents, locale, product.currency.toUpperCase())}
              </p>
              {product.description && (
                <p className={styles.desc}>{product.description}</p>
              )}
              <p className={styles.stock}>
                {product.stock > 0
                  ? t("inStock", { count: product.stock })
                  : t("outOfStock")}
              </p>
              <div className={styles.addWrap}>
                <AddToCartButton product={product} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
