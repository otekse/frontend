"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { ABOUT_ENABLED } from "@/lib/about";
import { useCart } from "@/lib/cart";
import { LOCALE_NAV_WIDTH_KEY } from "@/lib/locale-nav-transition";
import { useShopEnabled } from "./ShopState";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { MusicPlayer } from "./MusicPlayer";
import styles from "./SiteHeader.module.scss";

// The cart pill only belongs on the storefront surfaces — shop, product,
// cart, checkout, order — not the band homepage.
const STOREFRONT = /^\/(shop|cart|checkout|order)(\/|$)/;

export function SiteHeader() {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const { count } = useCart();
  const pathname = usePathname();
  const inStorefront = STOREFRONT.test(pathname);
  const shopOn = useShopEnabled();
  const navLinksRef = useRef<HTMLDivElement>(null);
  const activeLinkRef = useRef<HTMLAnchorElement>(null);
  const [activeIndicator, setActiveIndicator] = useState({
    offset: 0,
    width: 0,
  });
  const [indicatorVisible, setIndicatorVisible] = useState(false);
  const [indicatorAnimated, setIndicatorAnimated] = useState(false);
  const [navWidth, setNavWidth] = useState<number | null>(null);
  const [navWidthAnimated, setNavWidthAnimated] = useState(false);
  const navLinks = [
    { href: "/", label: t("home"), active: pathname === "/" },
    {
      href: "/concerts",
      label: t("concerts"),
      active: pathname === "/concerts",
    },
    ...(ABOUT_ENABLED
      ? [{ href: "/about", label: t("about"), active: pathname === "/about" }]
      : []),
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

  // The header stays mounted during Next.js client-side navigation. Measuring
  // the newly active link here lets one persistent element glide to its new
  // position instead of replacing a pill at the destination.
  useLayoutEffect(() => {
    const container = navLinksRef.current;
    const activeLink = activeLinkRef.current;
    if (!container || !activeLink) return;

    const updateIndicator = () => {
      const containerRect = container.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();
      setActiveIndicator({
        offset: linkRect.left - containerRect.left,
        width: linkRect.width,
      });
      setIndicatorVisible(true);
    };

    updateIndicator();
    // Position the pill before the first paint; only later route changes may
    // animate it. Otherwise the home-page pill visibly slides in on load.
    const frame = requestAnimationFrame(() => setIndicatorAnimated(true));
    const observer = new ResizeObserver(updateIndicator);
    observer.observe(container);
    observer.observe(activeLink);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [pathname, shopOn]);

  useLayoutEffect(() => {
    const nav = navLinksRef.current;
    const storedWidth = sessionStorage.getItem(LOCALE_NAV_WIDTH_KEY);
    if (!nav || !storedWidth) return;

    sessionStorage.removeItem(LOCALE_NAV_WIDTH_KEY);
    const previousWidth = Number(storedWidth);
    const nextWidth = nav.getBoundingClientRect().width;
    if (!Number.isFinite(previousWidth) || previousWidth === nextWidth) return;

    // This layout effect runs before the first paint of the new locale, so the
    // bar starts at its old width rather than visibly jumping to the new one.
    setNavWidth(previousWidth);
    const frame = requestAnimationFrame(() => {
      setNavWidthAnimated(true);
      setNavWidth(nextWidth);
    });

    return () => cancelAnimationFrame(frame);
  }, [locale]);

  return (
    <nav className={styles.nav}>
      <div
        ref={navLinksRef}
        className={`${styles.navLinks} ${
          navWidthAnimated ? styles.navLinksWidthAnimated : ""
        }`}
        data-primary-nav
        style={{ width: navWidth ?? undefined }}
        onTransitionEnd={(event) => {
          if (event.propertyName !== "width") return;
          setNavWidthAnimated(false);
          setNavWidth(null);
        }}
      >
        <span
          className={`${styles.navLinkIndicator} ${
            indicatorVisible ? styles.navLinkIndicatorVisible : ""
          } ${indicatorAnimated ? styles.navLinkIndicatorAnimated : ""}`}
          aria-hidden
          style={{
            transform: `translateX(${activeIndicator.offset}px)`,
            width: activeIndicator.width,
          }}
        />
        {navLinks.map(({ href, label, active }) => (
          <Link
            key={href}
            href={href}
            className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
            aria-current={active ? "page" : undefined}
            ref={active ? activeLinkRef : undefined}
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
