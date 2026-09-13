import { Archivo_Black, Space_Mono } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import { UmamiScript } from "@/components/UmamiScript";
import { albumPromoActive } from "@/lib/album";
import { todayInTallinn } from "@/lib/concerts";
import { shopEnabled } from "@/lib/shop-server";
import "./globals.css";

const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  weight: "400",
  subsets: ["latin", "latin-ext"],
});
const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin", "latin-ext"],
});

// Re-render every page at most an hour after it goes stale.
//
// The pages are prerendered, and several of them depend on today's date: the
// album promotion comes down on 1 January 2027 (lib/album.ts), and concerts
// retire into the archive the day after they happen (lib/concerts.ts). A page
// rendered once at build time would freeze "today" until the next deploy.
// Set here, on the root layout, because the lowest `revalidate` in a route
// applies to the whole route — so this covers every page under it.
export const revalidate = 3600;

// This must remain above the locale segment. If `[locale]/layout.tsx` owns the
// document shell, moving from `/et` to `/en` crosses a root-layout boundary
// and Next.js has to perform a full document navigation.
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const shopOn = await shopEnabled();
  const albumPromo = albumPromoActive(todayInTallinn());

  return (
    <html
      lang="en"
      className={`${archivoBlack.variable} ${spaceMono.variable}`}
      data-scroll-behavior="smooth"
    >
      <body>
        <AppShell shopOn={shopOn} albumPromo={albumPromo}>
          {children}
        </AppShell>
        <UmamiScript />
      </body>
    </html>
  );
}
