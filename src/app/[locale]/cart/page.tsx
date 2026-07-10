"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import ui from "@/styles/ui.module.scss";

export default function CartPage() {
  const t = useTranslations("Cart");
  const locale = useLocale();
  const { items, setQuantity, remove, totalCents } = useCart();

  if (items.length === 0) {
    return (
      <div className={ui.page}>
        <div className={ui.pageInnerNarrow}>
          <h1 className={ui.heading}>{t("title")}</h1>
          <p className="text-moss">{t("empty")}</p>
          <Link href="/shop" className={`${ui.inkLink} mt-4 inline-block`}>
            {t("continueShopping")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={ui.page}>
      <div className={ui.pageInnerNarrow}>
        <h1 className={ui.heading}>{t("title")}</h1>

        <ul className="divide-y divide-ink/15">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 py-4">
              <div className="flex-1">
                <p className="font-display text-ink">{item.name}</p>
                <p className="text-small text-sage">
                  {formatPrice(item.priceCents, locale)}
                </p>
              </div>
              <label className="flex items-center gap-2">
                <span className="sr-only">{t("quantity")}</span>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => setQuantity(item.id, Number(e.target.value))}
                  className={`${ui.input} w-16`}
                />
              </label>
              <p className="w-24 text-right font-bold text-ink">
                {formatPrice(item.priceCents * item.quantity, locale)}
              </p>
              <button
                type="button"
                onClick={() => remove(item.id)}
                className={ui.inkLink}
              >
                {t("remove")}
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex items-center justify-between border-t-2 border-ink pt-4">
          <span className="font-display text-lg text-ink">{t("total")}</span>
          <span className="font-display text-lg text-rust">
            {formatPrice(totalCents, locale)}
          </span>
        </div>

        <div className="mt-8">
          <Link href="/checkout" className={ui.pillDark}>
            {t("checkout")} →
          </Link>
        </div>
      </div>
    </div>
  );
}
