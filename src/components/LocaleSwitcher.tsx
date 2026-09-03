"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE } from "@/i18n/locale-cookie";
import { LOCALE_NAV_WIDTH_KEY } from "@/lib/locale-nav-transition";
import styles from "./LocaleSwitcher.module.scss";

// The universal globe: meridian, equator and two parallels. An inline SVG
// rather than an emoji, which renders differently on every platform and would
// not inherit the pill's ink colour.
function GlobeIcon() {
  return (
    <svg
      className={styles.globe}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <ellipse cx="12" cy="12" rx="4" ry="9" />
      <path d="M5.6 6.4c2.4 1.2 10.4 1.2 12.8 0" />
      <path d="M5.6 17.6c2.4-1.2 10.4-1.2 12.8 0" />
    </svg>
  );
}

// Two-position language switch: both languages stay visible with a knob under
// the active one, so it is clear what you are switching between. Remains a
// single button — the accessible name states the target language, since that
// is what pressing it does.
export function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [displayLocale, setDisplayLocale] = useState(locale);
  const [pendingLocale, setPendingLocale] = useState<string | null>(null);

  const other = displayLocale === "et" ? "en" : "et";
  const isEt = displayLocale === "et";

  const navigateToPendingLocale = () => {
    if (!pendingLocale) return;

    const nav = document.querySelector<HTMLElement>("[data-primary-nav]");
    if (nav) {
      sessionStorage.setItem(
        LOCALE_NAV_WIDTH_KEY,
        String(nav.getBoundingClientRect().width),
      );
    }

    setPendingLocale(null);
    router.replace(pathname, { locale: pendingLocale, scroll: false });
  };

  const changeLocale = () => {
    if (pendingLocale) return;

    // Persist the choice before navigation — the middleware reads this cookie
    // before any geo lookup, and next-intl no longer writes it now that
    // localeDetection is off.
    document.cookie = `${LOCALE_COOKIE}=${other}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;

    // Move the local knob before changing the locale route. The route remains
    // a Next.js client navigation, but waiting for the transition to finish
    // means the selected language visibly slides into place first.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      router.replace(pathname, { locale: other, scroll: false });
      return;
    }

    setDisplayLocale(other);
    setPendingLocale(other);
  };

  return (
    <button
      type="button"
      className={styles.switcher}
      aria-label={`${t("label")}: ${t(other)}`}
      onClick={changeLocale}
    >
      <GlobeIcon />
      {/* Decorative: the button's aria-label already names the action. */}
      <span className={styles.track} aria-hidden>
        <span
          className={`${styles.knob} ${isEt ? "" : styles.knobEnd}`}
          onTransitionEnd={(event) => {
            if (event.propertyName === "transform") navigateToPendingLocale();
          }}
          onTransitionCancel={navigateToPendingLocale}
        />
        <span className={`${styles.option} ${isEt ? styles.optionOn : ""}`}>
          EST
        </span>
        <span className={`${styles.option} ${isEt ? "" : styles.optionOn}`}>
          ENG
        </span>
      </span>
    </button>
  );
}
