import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { teaserItems } from "@/content/shop-teaser";
import { SHOP_ENABLED } from "@/lib/shop";
import styles from "./ShopTeaser.module.scss";

export function ShopTeaser() {
  const t = useTranslations("ShopTeaser");
  const locale = useLocale() as "et" | "en";

  return (
    <section className={styles.section}>
      <div className={styles.overline}>{t("overline")}</div>
      <div className={styles.title}>{t("title")}</div>
      <div className={styles.sub}>{t("sub")}</div>

      <div className={styles.grid}>
        {teaserItems.map((item) => {
          const style = { "--tilt": `${item.tilt}deg` } as React.CSSProperties;
          const inner = (
            <>
              <div className={styles.cardImage} />
              <div className={styles.cardRow}>
                <div className={styles.cardName}>{item.name[locale]}</div>
                <div className={styles.cardPrice}>{item.price}</div>
              </div>
            </>
          );

          // While the shop is off the cards stay visible as a teaser, but
          // nothing links into a storefront that 404s.
          return SHOP_ENABLED ? (
            <Link key={item.name.en} href="/shop" className={styles.card} style={style}>
              {inner}
            </Link>
          ) : (
            <div key={item.name.en} className={styles.card} style={style}>
              {inner}
            </div>
          );
        })}
      </div>

      {SHOP_ENABLED ? (
        <Link href="/shop" className={styles.cta}>
          {t("cta")} →
        </Link>
      ) : (
        <div className={styles.cta}>{t("comingSoon")}</div>
      )}
    </section>
  );
}
