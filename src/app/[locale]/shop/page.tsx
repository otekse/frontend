"use client";

import { useTranslations } from "next-intl";
import { useProductsControllerFindAll } from "@/api/generated/products/products";
import { ProductCard } from "@/components/ProductCard";
import { WheatWave } from "@/components/WheatWave";
import { assertShopEnabled } from "@/lib/shop";
import ui from "@/styles/ui.module.scss";
import styles from "./page.module.scss";

export default function ShopPage() {
  assertShopEnabled();
  const t = useTranslations("Shop");
  const { data: products, isLoading, isError } = useProductsControllerFindAll();

  return (
    <>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.brand}>ÕTEKSE</div>
          <h1 className={styles.title}>{t("title")}</h1>
          <p className={styles.sub}>{t("sub")}</p>
        </div>
        <div className={styles.waveWrap}>
          <WheatWave variant="wave" height={160} />
        </div>
      </header>

      <section className={styles.products}>
        <div className={styles.productsInner}>
          <div className={styles.overline}>— {t("productsOverline")}</div>
          <h2 className={styles.heading}>{t("productsTitle")}</h2>

          {isLoading && <p className={styles.status}>{t("loading")}</p>}
          {isError && <p className={styles.statusError}>{t("error")}</p>}
          {products && products.length === 0 && (
            <p className={styles.status}>{t("empty")}</p>
          )}

          {products && products.length > 0 && (
            <div className={styles.grid}>
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          <div className={`${ui.notePanel} ${styles.note}`}>
            <div className={ui.noteTitle}>{t("noteTitle")}</div>
            <div className={ui.noteSub}>
              {t("noteSub")}{" "}
              <a href="mailto:otekse@gmail.com">otekse@gmail.com</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
