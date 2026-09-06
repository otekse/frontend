import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AboutSection } from "@/components/home/AboutSection";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "../layout";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "About" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: `/${locale}/about`,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `/${l}/about`]),
      ),
    },
    openGraph: {
      type: "website",
      siteName: "Õtekse",
      locale: locale === "et" ? "et_EE" : "en_GB",
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: `${SITE_URL}/${locale}/about`,
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AboutSection asPage />;
}
