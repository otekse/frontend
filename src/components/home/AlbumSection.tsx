import { useLocale, useTranslations } from "next-intl";
import { concerts } from "@/content/concerts";
import { IMAGES } from "@/content/assets";
import { formatConcertDate, splitConcerts } from "@/lib/concerts";
import { swellPath } from "@/lib/swell";
import { SmartImage } from "@/components/SmartImage";
import { ScrollDrift } from "@/components/ui/ScrollDrift";
import { badgeKey } from "@/components/concerts/ConcertRow";
import styles from "./AlbumSection.module.scss";

// The "Rannapiigad" EP announcement, built from the Claude Design export
// `Otekse - Rannapiigad (standalone).html`: a sky-and-sea scene with a sun,
// sailing boats and birds over a gold panel holding the cover, the story and
// the release concerts. The header's "Uus album!" button links here; both are
// hidden from visitors, not deleted, once the promotion ends (lib/album.ts).
//
// Where it departs from the export, on the owner's direction or on purpose:
//  - The strip above the scene is the sky's cream, not forest, so the section
//    opens as one continuous sky. That made the export's wave-cut top edge
//    invisible, so it is gone; so is the closing "juba sel sügisel" strip.
//  - No language button in the section. The site header's switcher owns the
//    locale; a second one here would disagree with it.
//  - The release shows are not copy. They are entries in concerts.json flagged
//    `albumRelease`, so they also appear in the concerts lists and leave this
//    list the day after they happen, like every other date.
//  - The scroll drift runs through ScrollDrift, which only listens while the
//    section is on screen, instead of a page-long scroll handler.

// Travel in px across the section's whole pass through the viewport — the
// export's values. Positive drifts down as you scroll, negative drifts up.
const DRIFT = {
  sun: 90,
  birds: 70,
  cover: 54,
  title: 34,
  ships: 18,
  surf: -26,
} as const;

const CREDITS = [1, 2, 3, 4] as const;
const PARAS = [1, 2] as const;

// Far to near: [period, midline, depth, phase]. Midlines and rises keep the
// export's swell heights; lib/swell makes each path loop without a seam.
const SWELLS = [
  swellPath(1200, 26, 32, 0),
  swellPath(1200, 62, 56, 420),
  swellPath(1200, 92, 64, 780),
  swellPath(600, 120, 66, 170),
];

export function AlbumSection() {
  const t = useTranslations("Album");
  const tc = useTranslations("Concerts");
  const locale = useLocale() as "et" | "en";
  const shows = splitConcerts(concerts).upcoming.filter((c) => c.albumRelease);

  return (
    <section id="album" className={styles.section}>
      <div className={styles.head}>
        <div className={styles.overline}>— {t("overline")}</div>
      </div>

      <ScrollDrift className={styles.panel}>
        <div className={styles.scape}>
          <div className={styles.sky} />
          <div data-drift={DRIFT.sun} className={styles.sun} />

          <div data-drift={DRIFT.title} className={styles.skyTitle}>
            <h2 className={styles.title}>{t("title")}</h2>
            <ul className={styles.credits}>
              {CREDITS.map((n) => (
                <li key={n} className={styles.credit}>
                  {t(`credit${n}`)}
                </li>
              ))}
            </ul>
          </div>

          <div data-drift={DRIFT.birds} className={styles.birds} aria-hidden>
            {[1, 2, 3, 4].map((n) => (
              <svg
                key={n}
                viewBox="0 0 60 20"
                className={`${styles.bird} ${styles[`bird${n}`]}`}
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
              >
                <path d="M2,12 C8,4 13,4 18,11 C23,4 28,4 34,12" />
              </svg>
            ))}
          </div>

          <div data-drift={DRIFT.ships} className={styles.ships} aria-hidden>
            <svg viewBox="0 0 64 44" className={`${styles.ship} ${styles.ship1}`}>
              <path d="M3,34 L61,34 L53,42 L11,42 Z" fill="currentColor" />
              <rect x="31" y="4" width="1.6" height="30" fill="currentColor" />
              <path d="M33,7 L52,32 L33,32 Z" fill="currentColor" />
              <path d="M30,11 L14,32 L30,32 Z" fill="currentColor" />
            </svg>
            <svg viewBox="0 0 64 44" className={`${styles.ship} ${styles.ship2}`}>
              <path d="M5,34 L59,34 L52,41 L12,41 Z" fill="currentColor" />
              <rect x="31" y="8" width="1.4" height="26" fill="currentColor" />
              <path d="M33,11 L49,32 L33,32 Z" fill="currentColor" />
            </svg>
            <svg viewBox="0 0 64 44" className={`${styles.ship} ${styles.ship3}`}>
              <path d="M6,34 L58,34 L51,40 L13,40 Z" fill="currentColor" />
              <rect x="31" y="12" width="1.4" height="22" fill="currentColor" />
              <path d="M33,14 L47,32 L33,32 Z" fill="currentColor" />
            </svg>
          </div>

          <div data-drift={DRIFT.surf} className={styles.surf} aria-hidden>
            {SWELLS.map((d, i) => (
              <div key={i} className={`${styles.swell} ${styles[`swell${i + 1}`]}`}>
                <svg viewBox="0 0 2400 220" preserveAspectRatio="none">
                  <path d={d} fill="currentColor" />
                </svg>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.grain} aria-hidden />

        <div className={styles.body}>
          {/* The drift sits on this wrapper, the tilt on the card inside:
              ScrollDrift writes `transform` wholesale. */}
          <div data-drift={DRIFT.cover} className={styles.coverWrap}>
            <figure className={styles.coverCard}>
              <SmartImage
                src={IMAGES.albumCover}
                alt={t("coverAlt")}
                className={styles.cover}
              />
              <figcaption className={styles.coverCaption}>
                <span className={styles.coverName}>{t("coverName")}</span>
                <span className={styles.coverMeta}>{t("coverMeta")}</span>
              </figcaption>
            </figure>
          </div>

          <div className={styles.copy}>
            <p className={styles.kicker}>{t("kicker")}</p>

            <div className={styles.paras}>
              {PARAS.map((n) => (
                <p key={n} className={styles.para}>
                  {t(`para${n}`)}
                </p>
              ))}
            </div>

            <div className={styles.shows}>
              {shows.length > 0 && (
                <>
                  <h3 className={styles.showsLabel}>{t("showsLabel")}</h3>
                  <ul className={styles.showList}>
                    {shows.map((c) => (
                      <li key={c.start} className={styles.show}>
                        <span className={styles.showDate}>
                          {formatConcertDate(c, locale, "upcoming")}
                        </span>
                        <span className={styles.showPlace}>{c.title[locale]}</span>
                        <span
                          className={`${styles.showTag} ${
                            c.badge === "free" ? styles.showTagFree : ""
                          }`}
                        >
                          {tc(badgeKey[c.badge])}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <p className={styles.footnote}>{t("footnote")}</p>
            </div>
          </div>
        </div>
      </ScrollDrift>
    </section>
  );
}
