import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { concerts } from "@/content/concerts";
import { ConcertRow } from "@/components/concerts/ConcertRow";
import { ConcertsHero } from "@/components/concerts/ConcertsHero";
import { PastConcerts } from "@/components/concerts/PastConcerts";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "../layout";
import styles from "./page.module.scss";

// The full concerts listing, built from the Claude Design source
// `Kontserdid.dc.html` (see AGENTS.md "Design source"): photo-scatter hero,
// every upcoming date, then the collapsible archive.
//
// The design replaces the site header with a lone back button on this page.
// We deliberately keep the standard header and swap only its first pill
// (Kontserdid -> Koduleht) — see the spec in
// workspace/docs/superpowers/specs/2026-07-29-concerts-page-design.md.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ConcertsPage" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: `/${locale}/concerts`,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `/${l}/concerts`]),
      ),
    },
    openGraph: {
      type: "website",
      siteName: "Õtekse",
      locale: locale === "et" ? "et_EE" : "en_GB",
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: `${SITE_URL}/${locale}/concerts`,
    },
  };
}

export default async function ConcertsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("ConcertsPage");

  return (
    <>
      <ConcertsHero />

      <section id="kontserdid" className={styles.section}>
        <div className={styles.inner}>
          {concerts.map((c) => (
            <ConcertRow key={`${c.date}-${c.title.et}`} concert={c} />
          ))}

          <p className={styles.footnote}>{t("footnote")}</p>

          <PastConcerts />
        </div>
      </section>
    </>
  );
}
