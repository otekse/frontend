import { useLocale, useTranslations } from "next-intl";
import type { Concert, ConcertBadge } from "@/content/concerts";
import styles from "./ConcertRow.module.scss";

const badgeClass: Record<ConcertBadge, string> = {
  free: styles.badgeFree,
  ticketed: styles.badgeTicketed,
  soon: styles.badgeSoon,
};

const badgeKey: Record<ConcertBadge, "badgeFree" | "badgeTicketed" | "badgeSoon"> =
  {
    free: "badgeFree",
    ticketed: "badgeTicketed",
    soon: "badgeSoon",
  };

// One upcoming-concert row. Shared by the homepage teaser and the full
// /concerts list so the badge mapping lives in exactly one place.
export function ConcertRow({ concert }: { concert: Concert }) {
  const t = useTranslations("Concerts");
  const locale = useLocale() as "et" | "en";

  return (
    <div className={styles.row}>
      <div className={styles.date}>{concert.date}</div>
      <div>
        <div className={styles.name}>{concert.title[locale]}</div>
        <div className={styles.info}>{concert.info[locale]}</div>
        {concert.url && (
          <a
            href={concert.url}
            target="_blank"
            rel="noreferrer"
            className={styles.link}
          >
            {t("linkLabel")} ↗
          </a>
        )}
      </div>
      <div className={`${styles.badge} ${badgeClass[concert.badge]}`}>
        {t(badgeKey[concert.badge])}
      </div>
    </div>
  );
}
