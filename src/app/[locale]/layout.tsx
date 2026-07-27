import type { Metadata } from "next";
import { Archivo_Black, Space_Mono } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { UmamiScript } from "@/components/UmamiScript";
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

export const SITE_URL = "https://xn--tekse-cua.ee";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });

  return {
    metadataBase: new URL(SITE_URL),
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        et: "/et",
        en: "/en",
        // x-default is the URL that performs the language negotiation — the
        // unprefixed root — not an alias for the English tree.
        "x-default": "/",
      },
    },
    openGraph: {
      type: "website",
      siteName: "Õtekse",
      locale: locale === "et" ? "et_EE" : "en_GB",
      title: t("title"),
      description: t("description"),
      url: `${SITE_URL}/${locale}`,
    },
  };
}

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
        <UmamiScript />
      </body>
    </html>
  );
}
