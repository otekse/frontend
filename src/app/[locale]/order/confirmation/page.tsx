import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

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
    <div className="mx-auto max-w-2xl p-8 text-center">
      <h1 className="text-3xl font-bold">{t("title")}</h1>
      <p className="mt-4 opacity-80">{t("body")}</p>
      <p className="mt-2 text-sm opacity-60">{t("note")}</p>
      <Link href="/" className="mt-8 inline-block text-sm underline">
        {t("backHome")}
      </Link>
    </div>
  );
}
