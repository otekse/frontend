import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/home/Hero";
import { AboutSection } from "@/components/home/AboutSection";
import { MembersSection } from "@/components/home/MembersSection";
import { ConcertsSection } from "@/components/home/ConcertsSection";
import { ShopTeaser } from "@/components/home/ShopTeaser";
import { ShopClosed } from "@/components/home/ShopClosed";
import { SHOP_ENABLED } from "@/lib/shop";

// The band homepage, built from the Claude Design source (see AGENTS.md
// "Design source"): parallax hero, about, members, concerts, shop teaser.
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

  return (
    <>
      <Hero />
      <AboutSection />
      <MembersSection />
      <ConcertsSection />
      {SHOP_ENABLED ? <ShopTeaser /> : <ShopClosed />}
    </>
  );
}
