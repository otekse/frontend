import { useLocale, useTranslations } from "next-intl";
import { formatConcertDate, type Concert } from "@/lib/concerts";
import { Disclosure, DisclosureGroup } from "@/components/ui/Disclosure";
import styles from "./PastConcerts.module.scss";

// The archive at the foot of the concerts page. Collapsed by default —
// upcoming dates are what people come for.
//
// The rows arrive as a prop rather than from their own collection: past and
// upcoming are the same list split by date (see `splitConcerts`), so a concert
// files itself here the day after it happens.
export function PastConcerts({ concerts }: { concerts: Concert[] }) {
  const t = useTranslations("ConcertsPage");
  const locale = useLocale() as "et" | "en";

  if (concerts.length === 0) return null;

  return (
    <DisclosureGroup tone="cream" className={styles.group}>
      {/* The heading sits inside the <summary> rather than beside it as an
          sr-only copy: one element that both labels the control on screen and
          holds the page's outline. */}
      <Disclosure summary={<h2>{t("pastHeading")}</h2>}>
        {concerts.map((c) => (
          <div key={`${c.start}-${c.title.et}`} className={styles.row}>
            <div className={styles.date}>
              {formatConcertDate(c, locale, "past")}
            </div>
            <div>
              <div className={styles.name}>{c.title[locale]}</div>
              <div className={styles.info}>{c.info[locale]}</div>
            </div>
          </div>
        ))}
      </Disclosure>
    </DisclosureGroup>
  );
}
