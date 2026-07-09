"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useProductsControllerFindAll } from "@/api/generated/products/products";
import { formatPrice } from "@/lib/format";

export default function ShopPage() {
  const t = useTranslations("Shop");
  const locale = useLocale();
  const { data: products, isLoading, isError } = useProductsControllerFindAll();

  return (
    <div className="mx-auto max-w-5xl p-8">
      <h1 className="text-3xl font-bold">{t("title")}</h1>

      {isLoading && <p className="mt-6 opacity-70">{t("loading")}</p>}
      {isError && <p className="mt-6 text-red-600">{t("error")}</p>}
      {products && products.length === 0 && (
        <p className="mt-6 opacity-70">{t("empty")}</p>
      )}

      {products && products.length > 0 && (
        <ul className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => {
            const soldOut = p.stock <= 0;
            return (
              <li
                key={p.id}
                className="rounded-lg border border-black/10 p-4 dark:border-white/15"
              >
                <Link href={`/shop/${p.id}`} className="block">
                  <div className="aspect-square rounded bg-black/5 dark:bg-white/10" />
                  <h2 className="mt-3 font-medium">{p.name}</h2>
                  <p className="mt-1 opacity-80">
                    {formatPrice(p.priceCents, locale, p.currency.toUpperCase())}
                  </p>
                  {soldOut && (
                    <p className="mt-1 text-sm text-red-600">{t("outOfStock")}</p>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
