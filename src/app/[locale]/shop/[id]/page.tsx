"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useProductsControllerFindOne } from "@/api/generated/products/products";
import { AddToCartButton } from "@/components/AddToCartButton";
import { formatPrice } from "@/lib/format";

export default function ProductDetailPage() {
  const t = useTranslations("Product");
  const locale = useLocale();
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, isError } = useProductsControllerFindOne(id);

  return (
    <div className="mx-auto max-w-5xl p-8">
      <Link href="/shop" className="text-sm opacity-70 hover:opacity-100">
        ← {t("backToShop")}
      </Link>

      {isLoading && <p className="mt-6 opacity-70">…</p>}
      {isError && <p className="mt-6 text-red-600">{t("notFound")}</p>}

      {product && (
        <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="aspect-square rounded-lg bg-black/5 dark:bg-white/10" />
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="mt-2 text-xl opacity-90">
              {formatPrice(product.priceCents, locale, product.currency.toUpperCase())}
            </p>
            {product.description && (
              <p className="mt-4 opacity-80">{product.description}</p>
            )}
            <p className="mt-4 text-sm opacity-70">
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
  );
}
