import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/home/Hero";
import { AboutSection } from "@/components/home/AboutSection";
import { MembersSection } from "@/components/home/MembersSection";
import { ConcertsSection } from "@/components/home/ConcertsSection";
import { ShopTeaser } from "@/components/home/ShopTeaser";

// The band homepage, built from the Claude Design source (see AGENTS.md
// "Design source"): parallax hero, about, members, concerts, shop teaser.
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
      <ShopTeaser />
    </>
  );
}
