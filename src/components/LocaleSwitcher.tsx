"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE } from "@/i18n/locale-cookie";
import styles from "./LocaleSwitcher.module.scss";

// Toggles between the two locales, styled as the design's "EST ⌄" pill.
export function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const other = locale === "et" ? "en" : "et";

  return (
    <button
      type="button"
      className={styles.switcher}
      aria-label={`${t("label")}: ${t(other)}`}
      onClick={() => {
        // Persist the choice ourselves — the middleware reads this cookie
        // before any geo lookup, and next-intl no longer writes it now that
        // localeDetection is off.
        document.cookie = `${LOCALE_COOKIE}=${other}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
        router.replace(pathname, { locale: other });
      }}
    >
      {locale === "et" ? "EST" : "ENG"} ⌄
    </button>
  );
}
