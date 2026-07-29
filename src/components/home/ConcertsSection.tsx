import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { concerts } from "@/content/concerts";
import { splitConcerts, TEASER_COUNT } from "@/lib/concerts";
import { ConcertRow } from "@/components/concerts/ConcertRow";
import styles from "./ConcertsSection.module.scss";

// Homepage teaser: the next few dates, then through to the full /concerts
// page. Deliberately not the whole list — that page owns it now.
//
// Which dates are "next" is decided by today, not by hand (see splitConcerts).
export function ConcertsSection() {
  const t = useTranslations("Concerts");
  const { upcoming } = splitConcerts(concerts);

  return (
    <section id="kontserdid" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.overline}>— {t("overline")}</div>
        <h2 className={styles.title}>{t("title")}</h2>

        {upcoming.length > 0 ? (
          upcoming
            .slice(0, TEASER_COUNT)
            .map((c) => <ConcertRow key={`${c.start}-${c.title.et}`} concert={c} />)
        ) : (
          <p className={styles.empty}>{t("noUpcoming")}</p>
        )}

        <Link href="/concerts" className={styles.seeAll}>
          {t("seeAll")} →
        </Link>
      </div>
    </section>
  );
}
