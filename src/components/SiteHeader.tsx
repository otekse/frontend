"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useCart } from "@/lib/cart";
import { useShopEnabled } from "./ShopState";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { MusicPlayer } from "./MusicPlayer";
import styles from "./SiteHeader.module.scss";

// The cart pill only belongs on the storefront surfaces — shop, product,
// cart, checkout, order — not the band homepage.
const STOREFRONT = /^\/(shop|cart|checkout|order)(\/|$)/;

export function SiteHeader() {
  const t = useTranslations("Nav");
  const { count } = useCart();
  const pathname = usePathname();
  const inStorefront = STOREFRONT.test(pathname);
  const shopOn = useShopEnabled();

  return (
    <nav className={styles.nav}>
      <div className={styles.group}>
        <Link href="/#kontserdid" className={`${styles.pill} ${styles.pillAccent}`}>
          {t("concerts")}
        </Link>
        {shopOn && (
          <Link href="/shop" className={styles.pill}>
            <span className={styles.dot} aria-hidden />
            {t("shop")}
          </Link>
        )}
      </div>
      <div className={styles.group}>
        {inStorefront && (
          <Link href="/cart" className={styles.cartPill} aria-label={t("cart")}>
            <span aria-hidden>🧺</span>
            {count}
          </Link>
        )}
        <MusicPlayer />
        <LocaleSwitcher />
      </div>
    </nav>
  );
}
