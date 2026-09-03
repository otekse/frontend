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
  const navLinks = [
    { href: "/", label: t("home"), active: pathname === "/" },
    {
      href: "/concerts",
      label: t("concerts"),
      active: pathname === "/concerts",
    },
    { href: "/about", label: t("about"), active: pathname === "/about" },
    ...(shopOn
      ? [
          {
            href: "/shop",
            label: t("shop"),
            active: pathname === "/shop" || pathname.startsWith("/shop/"),
          },
        ]
      : []),
  ];

  return (
    <nav className={styles.nav}>
      <div className={styles.navLinks}>
        {navLinks.map(({ href, label, active }) => (
          <Link
            key={href}
            href={href}
            className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
            aria-current={active ? "page" : undefined}
          >
            {label}
          </Link>
        ))}
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
