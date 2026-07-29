import { getTranslations, setRequestLocale } from "next-intl/server";
import ui from "@/styles/ui.module.scss";
import styles from "./page.module.scss";

// Starting-point privacy notice (PROJECT_BRIEF.md §11). GDPR Art. 13
// transparency applies because Umami processes IP addresses server-side, even
// though the site sets no analytics cookie and needs no consent banner.
const CONTACT_EMAIL = "otekse@gmail.com";

const SECTIONS = [
  ["controllerTitle", "controllerBody"],
  ["analyticsTitle", "analyticsBody"],
  ["cookiesTitle", "cookiesBody"],
  ["thirdPartiesTitle", "thirdPartiesBody"],
  ["rightsTitle", "rightsBody"],
  ["contactTitle", "contactBody"],
] as const;

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Privacy");

  return (
    <div className={ui.page}>
      <div className={ui.pageInnerNarrow}>
        <h1 className={ui.heading}>{t("title")}</h1>
        {SECTIONS.map(([titleKey, bodyKey]) => (
          <section key={titleKey} className={styles.section}>
            <h2 className={styles.sectionTitle}>{t(titleKey)}</h2>
            <p className={styles.body}>{t(bodyKey, { email: CONTACT_EMAIL })}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
