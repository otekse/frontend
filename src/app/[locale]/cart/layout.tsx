import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SITE_NAME } from "@/lib/site";

// Metadata for the cart, which is a client component and cannot export its
// own. A cart is per-visitor and empty to a crawler, so it stays out of search
// results even while the shop is open (robots.ts blocks it while it is not).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Cart" });

  return {
    title: `${t("title")} — ${SITE_NAME}`,
    robots: { index: false, follow: true },
  };
}

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
