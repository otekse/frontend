import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/home/Hero";
import { AlbumSection } from "@/components/home/AlbumSection";
import { AboutSection } from "@/components/home/AboutSection";
import { MembersSection } from "@/components/home/MembersSection";
import { ConcertsSection } from "@/components/home/ConcertsSection";
import { ShopTeaser } from "@/components/home/ShopTeaser";
import { ShopClosed } from "@/components/home/ShopClosed";
import { albumPromoActive } from "@/lib/album";
import { todayInTallinn } from "@/lib/concerts";
import { getCampaignProgress } from "@/lib/hooandja-server";
import { shopEnabled } from "@/lib/shop-server";

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
  const shopOn = await shopEnabled();
  const albumOn = albumPromoActive(todayInTallinn());
  const campaign = albumOn ? await getCampaignProgress() : null;

  return (
    <>
      <Hero />
      <AboutSection showMoreLink />
      <MembersSection />
      <ConcertsSection />
      {shopOn ? <ShopTeaser /> : <ShopClosed />}
      {albumOn && <AlbumSection progress={campaign} />}
    </>
  );
}
