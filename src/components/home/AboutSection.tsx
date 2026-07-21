import { useTranslations } from "next-intl";
import { IMAGES } from "@/content/assets";
import { SmartImage } from "@/components/SmartImage";
import styles from "./AboutSection.module.scss";

export function AboutSection() {
  const t = useTranslations("About");

  return (
    <section id="meist" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <div className={styles.overline}>— {t("overline")}</div>
          <h2 className={styles.title}>{t("title")}</h2>
          <p>{t("p1")}</p>
          <p>{t("p2")}</p>
          <p>{t("p3")}</p>
        </div>
        <div className={styles.photoWrap}>
          <SmartImage
            src={IMAGES.band}
            alt={t("photoAlt")}
            className={styles.photo}
            objectPosition="center 20%"
          />
          <div className={styles.tag}>{t("photoTag")}</div>
        </div>
      </div>
    </section>
  );
}
