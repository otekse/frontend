"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart";
import { LocaleSwitcher } from "./LocaleSwitcher";

export function SiteHeader() {
  const t = useTranslations("Nav");
  const { count } = useCart();

  return (
    <header className="border-b border-black/10 dark:border-white/15">
      <nav className="mx-auto flex max-w-5xl items-center justify-between p-4">
        <Link href="/" className="text-lg font-semibold">
          Õtekse
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/shop">{t("shop")}</Link>
          <Link href="/cart">
            {t("cart")}
            {count > 0 ? ` (${count})` : ""}
          </Link>
          <LocaleSwitcher />
        </div>
      </nav>
    </header>
  );
}
