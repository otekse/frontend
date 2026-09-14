import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { SHARE_IMAGE, SITE_NAME } from "@/lib/site";

// Fallbacks only, for a page that sets no metadata of its own. Canonical,
// hreflang and og:url are deliberately NOT set here — every page sets them
// through localizedPageMetadata (lib/metadata.ts); inherited from a layout,
// they would name the wrong page.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: locale === "et" ? "et_EE" : "en_GB",
      images: [SHARE_IMAGE],
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return children;
}
