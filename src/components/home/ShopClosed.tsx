import { useTranslations } from "next-intl";
import { WheatMark } from "@/components/WheatMark";
import styles from "./ShopClosed.module.scss";

// The homepage shop band while the storefront is off (SHOP_ENABLED === false).
//
// Its own composition rather than ShopTeaser with the links stripped out:
// showing product cards and prices for things nobody can buy reads as a broken
// shop, and the old "Pood avaneb varsti" pill looked like a button but did
// nothing. Deliberately carries no card, no price, and no clickable element.
// The open-state design lives in ShopTeaser.
export function ShopClosed() {
  const t = useTranslations("ShopClosed");

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.overline}>{t("overline")}</div>

        <div className={styles.panel}>
          <WheatMark className={styles.mark} />
          <h2 className={styles.title}>{t("title")}</h2>
          <p className={styles.body}>{t("body")}</p>
          <span className={styles.tag}>{t("tag")}</span>
        </div>
      </div>
    </section>
  );
}
