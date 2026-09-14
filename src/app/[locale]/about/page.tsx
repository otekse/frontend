import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { TimelineSection } from "@/components/about/TimelineSection";
import { ABOUT_ENABLED } from "@/lib/about";
import { localizedPageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "About" });

  return localizedPageMetadata({
    locale,
    path: "/about",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  if (!ABOUT_ENABLED) notFound();

  const { locale } = await params;
  setRequestLocale(locale);

  return <TimelineSection />;
}
