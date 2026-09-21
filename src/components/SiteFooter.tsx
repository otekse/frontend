import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ABOUT_ENABLED } from "@/lib/about";
import { CONTACT_EMAIL } from "@/lib/contact";
import { SocialLinks } from "./SocialLinks";
import styles from "./SiteFooter.module.scss";

export function SiteFooter() {
  const t = useTranslations("Footer");

  return (
    <footer className={styles.footer}>
      <div className={styles.brand}>ÕTEKSE</div>
      <div className={styles.links}>
        <Link href="/">{t("home")}</Link>
        {ABOUT_ENABLED && <Link href="/about">{t("about")}</Link>}
        <Link href="/concerts">{t("concerts")}</Link>
        <Link href="/privacy">{t("privacy")}</Link>
      </div>
      <div className={styles.contact}>
        <SocialLinks label={t("socialLabel")} />
        {/* The address is spelled out, not hidden behind a word: it is the one
            contact a visitor may want to copy rather than click. */}
        <a className={styles.email} href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>
      </div>
      <div className={styles.rights}>
        {t("rights", { year: new Date().getFullYear() })}
      </div>
    </footer>
  );
}
