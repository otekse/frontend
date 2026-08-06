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
  // On the concerts page that first pill would link to the page you are
  // already reading, so it becomes the way back to the homepage instead. The
  // header keeps its shape everywhere — this is one label and one href, not a
  // different navigation (the design source mocks a back-button bar; we
  // deliberately do not follow it).
  //
  // The pill goes to the concerts *page*, not to `/#kontserdid`. The homepage
  // section is a teaser; the page is the full, date-filtered listing, and an
  // anchor left visitors scrolled to a summary wondering where the rest was.
  const onConcerts = pathname === "/concerts";

  return (
    <nav className={styles.nav}>
      <div className={styles.group}>
        <Link
          href={onConcerts ? "/" : "/concerts"}
          className={`${styles.pill} ${styles.pillAccent}`}
        >
          {onConcerts ? t("home") : t("concerts")}
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
