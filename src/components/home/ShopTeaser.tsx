import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { teaserItems } from "@/content/shop-teaser";
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
        {teaserItems.map((item) => (
          <Link
            key={item.name.en}
            href="/shop"
            className={styles.card}
            style={{ "--tilt": `${item.tilt}deg` } as React.CSSProperties}
          >
            <div className={styles.cardImage} />
            <div className={styles.cardRow}>
              <div className={styles.cardName}>{item.name[locale]}</div>
              <div className={styles.cardPrice}>{item.price}</div>
            </div>
          </Link>
        ))}
      </div>

      <Link href="/shop" className={styles.cta}>
        {t("cta")} →
      </Link>
    </section>
  );
}
