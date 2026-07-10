import { useLocale, useTranslations } from "next-intl";
import { concerts, type ConcertBadge } from "@/content/concerts";
import { WheatWave } from "@/components/WheatWave";
import styles from "./ConcertsSection.module.scss";

const badgeClass: Record<ConcertBadge, string> = {
  free: styles.badgeFree,
  ticketed: styles.badgeTicketed,
  soon: styles.badgeSoon,
};

export function ConcertsSection() {
  const t = useTranslations("Concerts");
  const locale = useLocale() as "et" | "en";

  const badgeLabel: Record<ConcertBadge, string> = {
    free: t("badgeFree"),
    ticketed: t("badgeTicketed"),
    soon: t("badgeSoon"),
  };

  return (
    <section id="kontserdid" className={styles.section}>
      <WheatWave variant="curve" height={110} />
      <div className={styles.inner}>
        <div className={styles.overline}>— {t("overline")}</div>
        <h2 className={styles.title}>{t("title")}</h2>

        {concerts.map((c) => (
          <div key={`${c.date}-${c.title.et}`} className={styles.row}>
            <div className={styles.date}>{c.date}</div>
            <div>
              <div className={styles.name}>{c.title[locale]}</div>
              <div className={styles.info}>{c.info[locale]}</div>
              {c.url && (
                <a
                  href={c.url}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.link}
                >
                  {t("linkLabel")} ↗
                </a>
              )}
            </div>
            <div className={`${styles.badge} ${badgeClass[c.badge]}`}>
              {badgeLabel[c.badge]}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
