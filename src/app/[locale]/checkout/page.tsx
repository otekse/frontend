"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import ui from "@/styles/ui.module.scss";

// Checkout is intentionally a stub: `POST /checkout` + Stripe Checkout is a
// later step and depends on a Stripe account (owner checklist). When the
// endpoint exists, this page will call it with the cart and redirect to the
// returned Stripe session URL — never trusting client-side prices
// (PROJECT_BRIEF.md §4, §5). The server re-validates everything.
export default function CheckoutPage() {
  const t = useTranslations("Checkout");
  const tCart = useTranslations("Cart");
  const locale = useLocale();
  const { items, totalCents } = useCart();

  return (
    <div className={ui.page}>
      <div className={ui.pageInnerNarrow}>
        <h1 className={ui.heading}>{t("title")}</h1>

        <ul className="divide-y divide-ink/15">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between py-3 text-ink">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>{formatPrice(item.priceCents * item.quantity, locale)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex justify-between border-t-2 border-ink pt-4 font-display text-ink">
          <span>{tCart("total")}</span>
          <span className="text-rust">{formatPrice(totalCents, locale)}</span>
        </div>

        <div className={`${ui.notePanel} mt-10`}>
          <div className={ui.noteTitle}>{t("pending")}</div>
        </div>

        <div className="mt-8">
          <Link href="/cart" className={ui.inkLink}>
            ← {t("backToCart")}
          </Link>
        </div>
      </div>
    </div>
  );
}
