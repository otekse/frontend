import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { JsonLd } from "@/components/JsonLd";
import { Hero } from "@/components/home/Hero";
import { AlbumSection } from "@/components/home/AlbumSection";
import { AboutSection } from "@/components/home/AboutSection";
import { MembersSection } from "@/components/home/MembersSection";
import { ConcertsSection } from "@/components/home/ConcertsSection";
import { ShopTeaser } from "@/components/home/ShopTeaser";
import { ShopClosed } from "@/components/home/ShopClosed";
import { members } from "@/content/members";
import { albumPromoActive } from "@/lib/album";
import { todayInTallinn } from "@/lib/concerts";
import { getCampaignProgress } from "@/lib/hooandja-server";
import { localizedPageMetadata } from "@/lib/metadata";
import { shopEnabled } from "@/lib/shop-server";
import { homeJsonLd } from "@/lib/structured-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });

  return localizedPageMetadata({
    locale,
    path: "",
    title: t("title"),
    description: t("description"),
  });
}

// The band homepage, built from the Claude Design source (see AGENTS.md
// "Design source"): parallax hero, about, members, concerts, shop teaser,
// then the "Rannapiigad" album announcement.
//
// When the promotion ends (lib/album.ts) the album section and the header
// button that links to it are hidden from visitors — not deleted: both stay in
// the code, and moving the end date shows them again. While it runs, the
// Hooandja campaign's figures are fetched here, on our server, and passed in
// (lib/hooandja-server.ts); they refresh with the page's hourly revalidate.
//
// The shop band has two designs, not one design with the links removed:
// ShopTeaser when the storefront is open, ShopClosed when it isn't.
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Meta");
  const shopOn = await shopEnabled();
  const albumOn = albumPromoActive(todayInTallinn());
  const campaign = albumOn ? await getCampaignProgress() : null;

  return (
    <>
      <JsonLd
        data={homeJsonLd({
          locale: locale === "et" ? "et" : "en",
          description: t("description"),
          memberNames: members.map((m) => m.name),
        })}
      />
      <Hero />
      <AboutSection showMoreLink />
      <MembersSection />
      <ConcertsSection />
      {shopOn ? <ShopTeaser /> : <ShopClosed />}
      {albumOn && <AlbumSection progress={campaign} />}
    </>
  );
}
