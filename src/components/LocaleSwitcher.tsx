"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
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
      onClick={() => router.replace(pathname, { locale: other })}
    >
      {locale === "et" ? "EST" : "ENG"} ⌄
    </button>
  );
}
