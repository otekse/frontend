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
import { shopEnabled } from "@/lib/shop-server";

// The band homepage, built from the Claude Design source (see AGENTS.md
// "Design source"): parallax hero, about, members, concerts, the
// "Rannapiigad" album announcement, shop teaser.
//
// The album section comes down on its own at the end of the promotion (see
// lib/album.ts), together with the header button that links to it.
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

  return (
    <>
      <Hero />
      <AboutSection showMoreLink />
      <MembersSection />
      <ConcertsSection />
      {albumOn && <AlbumSection />}
      {shopOn ? <ShopTeaser /> : <ShopClosed />}
    </>
  );
}
