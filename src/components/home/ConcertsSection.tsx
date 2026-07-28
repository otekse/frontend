import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { concerts, TEASER_COUNT } from "@/content/concerts";
import { ConcertRow } from "@/components/concerts/ConcertRow";
import styles from "./ConcertsSection.module.scss";

// Homepage teaser: the next few dates, then through to the full /concerts
// page. Deliberately not the whole list — that page owns it now.
export function ConcertsSection() {
  const t = useTranslations("Concerts");

  return (
    <section id="kontserdid" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.overline}>— {t("overline")}</div>
        <h2 className={styles.title}>{t("title")}</h2>

        {concerts.slice(0, TEASER_COUNT).map((c) => (
          <ConcertRow key={`${c.date}-${c.title.et}`} concert={c} />
        ))}

        <Link href="/concerts" className={styles.seeAll}>
          {t("seeAll")} →
        </Link>
      </div>
    </section>
  );
}
