import { useLocale, useTranslations } from "next-intl";
import { timeline } from "@/content/timeline";
import { timelinePhoto } from "@/content/assets";
import { SmartImage } from "@/components/SmartImage";
import { TimelineRise } from "./TimelineRise";
import styles from "./TimelineSection.module.scss";

// The band's own record, year by year, built from the Claude Design export
// `Otekse - Meist (standalone).html` ("AJATELG"): a sticky year with its entry
// count beside a hairline, a gold dot per entry, the date, the text, link
// pills, and the photos as tilted paper prints. Every year is open — nothing
// collapses.
//
// It is the whole About page (the owner dropped the introduction that used to
// sit above it), so its title is the page's h1 and each year an h2.
//
// Where it departs from the export:
//  - The export's header also carries an introduction and the line-up; the
//    page shows only the timeline.
//  - Its "LIIKUMINE" switcher is a design-review control for trying three
//    scroll animations. The page ships the default, "Tõus", in TimelineRise.
//  - The photos are the band's real ones — all of them, where the export
//    showed placeholder counts — and each opens full size in its own tab.

// Alternating tilts, as in the export: the first print leans left.
const TILTS = ["tiltLeft", "tiltRight"] as const;

export function TimelineSection() {
  const t = useTranslations("About");
  const locale = useLocale() as "et" | "en";

  return (
    <section id="ajatelg" className={styles.section}>
      <div className={styles.head}>
        <div className={styles.overline}>— {t("overline")}</div>
        <h1 className={styles.title}>{t("timelineTitle")}</h1>
      </div>

      <TimelineRise className={styles.years}>
        {timeline.map(({ year, entries }) => (
          <div key={year} className={styles.year}>
            <div className={styles.yearLabel}>
              <h2 className={styles.yearNumber}>{year}</h2>
              <div className={styles.yearCount}>
                {t("timelineCount", { count: entries.length })}
              </div>
            </div>

            <ol className={styles.entries}>
              {entries.map((e, i) => {
                const text = e.text[locale];
                return (
                  <li key={i} data-entry className={styles.entry}>
                    <div data-rise className={styles.rise}>
                      <span className={styles.dot} aria-hidden />
                      {e.date && <div className={styles.date}>{e.date[locale]}</div>}
                      <p className={styles.text}>{text}</p>

                      {e.links.length > 0 && (
                        <ul className={styles.links}>
                          {e.links.map((l) => (
                            <li key={l.url}>
                              <a
                                href={l.url}
                                target="_blank"
                                rel="noreferrer"
                                className={styles.link}
                              >
                                ↗ {l.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}

                      {e.photos.length > 0 && (
                        <ul className={styles.photos}>
                          {e.photos.map((id, n) => {
                            const photo = timelinePhoto(id);
                            return (
                              // The rise writes `transform` on the figure, so
                              // the tilt lives on the print inside it.
                              <li key={id} data-fig className={styles.figure}>
                                <a
                                  href={photo.full}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={`${styles.print} ${styles[TILTS[n % 2]]}`}
                                >
                                  <SmartImage
                                    src={photo.thumb}
                                    alt={t("timelinePhotoAlt", {
                                      title: text,
                                      n: n + 1,
                                      count: e.photos.length,
                                    })}
                                    className={styles.photo}
                                    loading="lazy"
                                  />
                                </a>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </TimelineRise>
    </section>
  );
}
