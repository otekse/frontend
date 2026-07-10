"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart";
import { LocaleSwitcher } from "./LocaleSwitcher";
import styles from "./SiteHeader.module.scss";

export function SiteHeader() {
  const t = useTranslations("Nav");
  const { count } = useCart();

  return (
    <nav className={styles.nav}>
      <div className={styles.group}>
        <Link href="/#kontserdid" className={`${styles.pill} ${styles.pillAccent}`}>
          {t("concerts")}
        </Link>
        <Link href="/shop" className={styles.pill}>
          <span className={styles.dot} aria-hidden />
          {t("shop")}
        </Link>
      </div>
      <div className={styles.group}>
        <Link href="/cart" className={styles.cartPill} aria-label={t("cart")}>
          <span aria-hidden>🧺</span>
          {count}
        </Link>
        <LocaleSwitcher />
      </div>
    </nav>
  );
}
