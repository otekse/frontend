import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

// NOTE: this is a placeholder homepage. The real design lives in the Claude
// Design project (see AGENTS.md "Design source") and needs `/design-login` to
// access; build the actual homepage from that source once authenticated.
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");

  return (
    <div className="mx-auto max-w-5xl p-8">
      <h1 className="text-5xl font-bold tracking-tight">{t("title")}</h1>
      <p className="mt-3 text-lg opacity-80">{t("tagline")}</p>
      <Link
        href="/shop"
        className="mt-8 inline-block rounded bg-foreground px-5 py-2.5 text-sm font-medium text-background"
      >
        {t("shopCta")}
      </Link>
      <p className="mt-12 border-t border-black/10 pt-4 text-sm opacity-60 dark:border-white/15">
        {t("placeholderNotice")}
      </p>
    </div>
  );
}
