import type { Metadata } from "next";
import { Archivo_Black, Space_Mono } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Providers } from "./providers";
import "../globals.css";

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

export const metadata: Metadata = {
  title: "Õtekse",
  description: "Õtekse — a small Estonian brand and merch store.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${archivoBlack.variable} ${spaceMono.variable}`}
    >
      <body>
        <NextIntlClientProvider>
          <Providers>
            <SiteHeader />
            <main>{children}</main>
            <SiteFooter />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
