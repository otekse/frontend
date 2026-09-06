import { Archivo_Black, Space_Mono } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import { UmamiScript } from "@/components/UmamiScript";
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

// This must remain above the locale segment. If `[locale]/layout.tsx` owns the
// document shell, moving from `/et` to `/en` crosses a root-layout boundary
// and Next.js has to perform a full document navigation.
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const shopOn = await shopEnabled();

  return (
    <html
      lang="en"
      className={`${archivoBlack.variable} ${spaceMono.variable}`}
      data-scroll-behavior="smooth"
    >
      <body>
        <AppShell shopOn={shopOn}>{children}</AppShell>
        <UmamiScript />
      </body>
    </html>
  );
}
