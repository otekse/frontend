"use client";

import { ViewTransition } from "react";
import { NextIntlClientProvider } from "next-intl";
import { usePathname } from "next/navigation";
import etMessages from "../../messages/et.json";
import enMessages from "../../messages/en.json";
import { Providers } from "@/app/[locale]/providers";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ShopStateProvider } from "@/components/ShopState";
import { LocaleDocumentAttributes } from "@/components/LocaleDocumentAttributes";

type AppLocale = "et" | "en";

function getLocale(pathname: string): AppLocale {
  return pathname.startsWith("/et") ? "et" : "en";
}

// Kept above the `[locale]` segment so the client providers, header, music
// player and footer survive an Estonian/English route change. Only the page
// content is replaced by the App Router.
export function AppShell({
  children,
  shopOn,
}: {
  children: React.ReactNode;
  shopOn: boolean;
}) {
  const locale = getLocale(usePathname());
  const messages = locale === "et" ? etMessages : enMessages;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <LocaleDocumentAttributes locale={locale} />
      <Providers>
        <ShopStateProvider enabled={shopOn}>
          <SiteHeader />
          <main>
            <ViewTransition
              key={locale}
              name="locale-content"
              share="auto"
              enter="auto"
              default="none"
            >
              {children}
            </ViewTransition>
          </main>
          <SiteFooter />
        </ShopStateProvider>
      </Providers>
    </NextIntlClientProvider>
  );
}
