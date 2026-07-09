"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const t = useTranslations("Cart");
  const locale = useLocale();
  const { items, setQuantity, remove, totalCents } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="mt-6 opacity-70">{t("empty")}</p>
        <Link href="/shop" className="mt-4 inline-block text-sm underline">
          {t("continueShopping")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-8">
      <h1 className="text-3xl font-bold">{t("title")}</h1>

      <ul className="mt-6 divide-y divide-black/10 dark:divide-white/15">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-4 py-4">
            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm opacity-70">
                {formatPrice(item.priceCents, locale)}
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <span className="sr-only">{t("quantity")}</span>
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => setQuantity(item.id, Number(e.target.value))}
                className="w-16 rounded border border-black/15 bg-transparent px-2 py-1 dark:border-white/20"
              />
            </label>
            <p className="w-24 text-right">
              {formatPrice(item.priceCents * item.quantity, locale)}
            </p>
            <button
              type="button"
              onClick={() => remove(item.id)}
              className="text-sm opacity-60 hover:opacity-100"
            >
              {t("remove")}
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between border-t border-black/10 pt-4 dark:border-white/15">
        <span className="text-lg font-semibold">{t("total")}</span>
        <span className="text-lg font-semibold">
          {formatPrice(totalCents, locale)}
        </span>
      </div>

      <Link
        href="/checkout"
        className="mt-6 inline-block rounded bg-foreground px-5 py-2.5 text-sm font-medium text-background"
      >
        {t("checkout")}
      </Link>
    </div>
  );
}
