import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import ui from "@/styles/ui.module.scss";

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
      <div className={`${ui.pageInnerNarrow} text-center`}>
        <h1 className={ui.heading}>{t("title")}</h1>
        <p className="text-moss">{t("body")}</p>
        <p className="mt-2 text-small text-sage">{t("note")}</p>
        <div className="mt-8">
          <Link href="/" className={ui.inkLink}>
            {t("backHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
