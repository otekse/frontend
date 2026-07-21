import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import ui from "@/styles/ui.module.scss";
import styles from "./page.module.scss";

// Post-payment return page. Purely informational: the trustworthy signal that
// payment succeeded is the Stripe webhook on the backend, never this page
// (PROJECT_BRIEF.md §5). Do not mark orders paid or grant anything here.
export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("OrderConfirmation");

  return (
    <div className={ui.page}>
      <div className={`${ui.pageInnerNarrow} ${styles.inner}`}>
        <h1 className={ui.heading}>{t("title")}</h1>
        <p className={ui.muted}>{t("body")}</p>
        <p className={styles.note}>{t("note")}</p>
        <div className={ui.actions}>
          <Link href="/" className={ui.inkLink}>
            {t("backHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
