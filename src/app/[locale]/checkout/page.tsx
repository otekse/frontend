"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";

// Checkout is intentionally a stub for now: `POST /checkout` + Stripe Checkout
// is a later step and depends on a Stripe account (owner checklist). When the
// endpoint exists, this page will call it with the cart and redirect to the
// returned Stripe session URL — never trusting client-side prices
// (PROJECT_BRIEF.md §4, §5). The server re-validates everything.
export default function CheckoutPage() {
  const t = useTranslations("Checkout");
  const tCart = useTranslations("Cart");
  const locale = useLocale();
  const { items, totalCents } = useCart();

  return (
    <div className="mx-auto max-w-3xl p-8">
      <h1 className="text-3xl font-bold">{t("title")}</h1>

      <ul className="mt-6 divide-y divide-black/10 dark:divide-white/15">
        {items.map((item) => (
          <li key={item.id} className="flex justify-between py-3">
            <span>
              {item.name} × {item.quantity}
            </span>
            <span>{formatPrice(item.priceCents * item.quantity, locale)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex justify-between border-t border-black/10 pt-4 font-semibold dark:border-white/15">
        <span>{tCart("total")}</span>
        <span>{formatPrice(totalCents, locale)}</span>
      </div>

      <p className="mt-8 rounded border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
        {t("pending")}
      </p>

      <Link href="/cart" className="mt-6 inline-block text-sm underline">
        ← {t("backToCart")}
      </Link>
    </div>
  );
}
