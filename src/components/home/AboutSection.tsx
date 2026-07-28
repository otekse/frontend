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

          {/* Native <details> rather than a JS accordion: it is keyboard- and
              screen-reader-accessible for free, works with JS disabled, and
              keeps this a server component. The first is open so the section
              never reads as empty. */}
          <div className={styles.accordion}>
            {[1, 2, 3].map((n) => (
              <details key={n} className={styles.item} open={n === 1}>
                <summary className={styles.summary}>
                  {t(`s${n}Title`)}
                  <span className={styles.marker} aria-hidden />
                </summary>
                <p className={styles.body}>{t(`s${n}Body`)}</p>
              </details>
            ))}
          </div>
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
