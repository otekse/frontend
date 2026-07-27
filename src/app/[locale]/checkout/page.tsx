"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { assertShopEnabled } from "@/lib/shop";
import ui from "@/styles/ui.module.scss";
import styles from "./page.module.scss";

// Checkout is intentionally a stub: `POST /checkout` + Stripe Checkout is a
// later step and depends on a Stripe account (owner checklist). When the
// endpoint exists, this page will call it with the cart and redirect to the
// returned Stripe session URL — never trusting client-side prices
// (PROJECT_BRIEF.md §4, §5). The server re-validates everything.
export default function CheckoutPage() {
  assertShopEnabled();
  const t = useTranslations("Checkout");
  const tCart = useTranslations("Cart");
  const locale = useLocale();
  const { items, totalCents } = useCart();

  return (
    <div className={ui.page}>
      <div className={ui.pageInnerNarrow}>
        <h1 className={ui.heading}>{t("title")}</h1>

        <ul className={ui.lineItems}>
          {items.map((item) => (
            <li key={item.id} className={styles.row}>
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>{formatPrice(item.priceCents * item.quantity, locale)}</span>
            </li>
          ))}
        </ul>

        <div className={ui.totalRow}>
          <span>{tCart("total")}</span>
          <span className={ui.totalValue}>{formatPrice(totalCents, locale)}</span>
        </div>

        <div className={`${ui.notePanel} ${styles.note}`}>
          <div className={ui.noteTitle}>{t("pending")}</div>
        </div>

        <div className={ui.actions}>
          <Link href="/cart" className={ui.inkLink}>
            ← {t("backToCart")}
          </Link>
        </div>
      </div>
    </div>
  );
}
