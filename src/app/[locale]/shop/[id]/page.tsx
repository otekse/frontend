"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useProductsControllerFindOne } from "@/api/generated/products/products";
import { AddToCartButton } from "@/components/AddToCartButton";
import { formatPrice } from "@/lib/format";
import ui from "@/styles/ui.module.scss";

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

        {isLoading && <p className="mt-6 text-moss">…</p>}
        {isError && <p className="mt-6 text-rust">{t("notFound")}</p>}

        {product && (
          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className={`${ui.card} bg-sand aspect-square`}>
              {product.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div>
              <h1 className="font-display text-h2 text-ink">{product.name}</h1>
              <p className="mt-3 text-xl font-bold text-rust">
                {formatPrice(product.priceCents, locale, product.currency.toUpperCase())}
              </p>
              {product.description && (
                <p className="mt-4 leading-body text-moss">{product.description}</p>
              )}
              <p className="mt-4 text-small text-sage">
                {product.stock > 0
                  ? t("inStock", { count: product.stock })
                  : t("outOfStock")}
              </p>
              <div className="mt-6">
                <AddToCartButton product={product} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
