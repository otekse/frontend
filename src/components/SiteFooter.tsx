import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import styles from "./SiteFooter.module.scss";

export function SiteFooter() {
  const t = useTranslations("Footer");

  return (
    <footer className={styles.footer}>
      <div className={styles.brand}>ÕTEKSE</div>
      <div className={styles.links}>
        <Link href="/#meist">{t("about")}</Link>
        <Link href="/#kontserdid">{t("concerts")}</Link>
        <Link href="/privacy">{t("privacy")}</Link>
      </div>
      <div className={styles.rights}>
        {t("rights", { year: new Date().getFullYear() })}
      </div>
    </footer>
  );
}
