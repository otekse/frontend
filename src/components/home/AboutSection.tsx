import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { IMAGES } from "@/content/assets";
import { SmartImage } from "@/components/SmartImage";
import { ABOUT_ENABLED } from "@/lib/about";
import { Disclosure, DisclosureGroup } from "@/components/ui/Disclosure";
import styles from "./AboutSection.module.scss";

type AboutSectionProps = {
  showMoreLink?: boolean;
};

export function AboutSection({
  showMoreLink = false,
}: AboutSectionProps) {
  const t = useTranslations("About");

  return (
    <section id="meist" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <div className={styles.overline}>— {t("overline")}</div>
          <h2 className={styles.title}>{t("title")}</h2>

          {/* The first is open so the section never reads as empty. */}
          <DisclosureGroup>
            {[1, 2, 3].map((n) => (
              <Disclosure key={n} summary={t(`s${n}Title`)} defaultOpen={n === 1}>
                <p className={styles.body}>{t(`s${n}Body`)}</p>
              </Disclosure>
            ))}
          </DisclosureGroup>
          {showMoreLink && ABOUT_ENABLED && (
            <Link href="/about" className={styles.moreLink}>
              {t("more")}
            </Link>
          )}
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
