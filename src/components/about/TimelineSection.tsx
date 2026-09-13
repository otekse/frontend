import { useLocale, useTranslations } from "next-intl";
import { timeline } from "@/content/timeline";
import { timelinePhoto } from "@/content/assets";
import { linkLabel } from "@/lib/timeline";
import { SmartImage } from "@/components/SmartImage";
import { Disclosure, DisclosureGroup } from "@/components/ui/Disclosure";
import styles from "./TimelineSection.module.scss";

// The band's own record of what they have done, year by year, on the About
// page. The entries and their photos come from timeline.json (the band's
// "Õtekse's doings" document); see lib/timeline.ts for the rules it follows.
//
// One collapsible bar per year, the newest open. That keeps a long record to
// a glance, and because the photos are lazy the browser downloads nothing for
// a year until it is opened.
export function TimelineSection() {
  const t = useTranslations("About");
  const locale = useLocale() as "et" | "en";

  return (
    <section id="ajatelg" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.overline}>— {t("timelineOverline")}</div>
        <h2 className={styles.title}>{t("timelineTitle")}</h2>

        <DisclosureGroup tone="cream">
          {timeline.map(({ year, entries }, i) => (
            <Disclosure key={year} summary={<h3>{year}</h3>} defaultOpen={i === 0}>
              <ol className={styles.entries}>
                {entries.map((e, j) => {
                  const title = e.title[locale];
                  return (
                    <li key={j} className={styles.entry}>
                      <div className={styles.when}>{e.when?.[locale]}</div>
                      <div className={styles.content}>
                        <h4 className={styles.entryTitle}>{title}</h4>
                        {e.body && <p className={styles.body}>{e.body[locale]}</p>}

                        {e.links.length > 0 && (
                          <ul className={styles.links}>
                            {e.links.map((url) => (
                              <li key={url}>
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={styles.link}
                                >
                                  {linkLabel(url)} ↗
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
                                <li key={id}>
                                  {/* Opens the full photo: the grid crops
                                      every shot to one shape. */}
                                  <a
                                    href={photo.full}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={styles.photoLink}
                                  >
                                    <SmartImage
                                      src={photo.thumb}
                                      alt={t("timelinePhotoAlt", {
                                        title,
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
            </Disclosure>
          ))}
        </DisclosureGroup>
      </div>
    </section>
  );
}
