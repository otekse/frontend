"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart";
import { CONTACT_EMAIL } from "@/lib/contact";
import { formatPrice } from "@/lib/format";
import { orderEmailBody, orderMailto } from "@/lib/order-email";
import { assertShopEnabled } from "@/lib/shop";
import ui from "@/styles/ui.module.scss";
import styles from "./page.module.scss";

// The shop takes orders by email, not payment. "Saada tellimus e-kirjaga"
// opens the visitor's mail app with the cart written out as an order to the
// band (lib/order-email.ts); they add their details and send it, and the band
// replies to arrange payment and delivery. Nothing is charged or stored here.
export default function CartPage() {
  assertShopEnabled();
  const t = useTranslations("Cart");
  const locale = useLocale();
  const { items, setQuantity, remove, totalCents } = useCart();

  if (items.length === 0) {
    return (
      <div className={ui.page}>
        <div className={ui.pageInnerNarrow}>
          <h1 className={ui.heading}>{t("title")}</h1>
          <p className={ui.muted}>{t("empty")}</p>
          <Link href="/shop" className={`${ui.inkLink} ${styles.continue}`}>
            {t("continueShopping")}
          </Link>
        </div>
      </div>
    );
  }

  const orderHref = orderMailto(
    CONTACT_EMAIL,
    t("emailSubject"),
    orderEmailBody(
      items,
      {
        intro: t("emailIntro"),
        total: t("emailTotal"),
        name: t("emailName"),
        phone: t("emailPhone"),
        delivery: t("emailDelivery"),
        notes: t("emailNotes"),
      },
      (cents) => formatPrice(cents, locale),
    ),
  );

  return (
    <div className={ui.page}>
      <div className={ui.pageInnerNarrow}>
        <h1 className={ui.heading}>{t("title")}</h1>

        <ul className={ui.lineItems}>
          {items.map((item) => (
            <li key={item.id} className={styles.row}>
              <div className={styles.info}>
                <p className={styles.name}>{item.name}</p>
                <p className={ui.metaSmall}>
                  {formatPrice(item.priceCents, locale)}
                </p>
              </div>
              <label className={styles.qty}>
                <span className="sr-only">{t("quantity")}</span>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => setQuantity(item.id, Number(e.target.value))}
                  className={`${ui.input} ${styles.qtyInput}`}
                />
              </label>
              <p className={styles.lineTotal}>
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

        <div className={ui.totalRow}>
          <span className={styles.totalText}>{t("total")}</span>
          <span className={`${ui.totalValue} ${styles.totalText}`}>
            {formatPrice(totalCents, locale)}
          </span>
        </div>

        <div className={ui.actions}>
          <a href={orderHref} className={ui.pillDark}>
            {t("sendOrder")} →
          </a>
        </div>

        <div className={`${ui.notePanel} ${styles.orderNote}`}>
          <div className={ui.noteTitle}>{t("howTitle")}</div>
          <div className={ui.noteSub}>{t("howBody")}</div>
          {/* For visitors with no mail app set up, where mailto: does nothing. */}
          <div className={`${ui.noteSub} ${styles.orderFallback}`}>
            {t("noMailApp")}{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </div>
        </div>
      </div>
    </div>
  );
}
