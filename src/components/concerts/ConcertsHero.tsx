"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { IMAGES } from "@/content/assets";
import { SmartImage } from "@/components/SmartImage";
import { useParallax } from "@/lib/use-parallax";
import styles from "./ConcertsHero.module.scss";

// Scattered live photos at four depths. Cards further "back" drift fastest,
// sit smaller and are dimmed and blurred; the front-right card carries the
// LIVE tag. `alt` is a message key, not a string — the photos are content, so
// their descriptions are translated like everything else.
const CARDS = [
  {
    src: IMAGES.live.four,
    alt: "photo1Alt",
    parallax: 0.3,
    className: styles.cardBackLeft,
  },
  {
    src: IMAGES.live.two,
    alt: "photo2Alt",
    parallax: 0.24,
    className: styles.cardBackRight,
    // A landscape original in a portrait frame: biasing the crop upward keeps
    // faces in shot instead of framing mid-torso.
    objectPosition: "center 35%",
  },
  {
    src: IMAGES.live.one,
    alt: "photo3Alt",
    parallax: 0.14,
    className: styles.cardFrontLeft,
  },
  {
    src: IMAGES.live.three,
    alt: "photo4Alt",
    parallax: 0.08,
    className: styles.cardFrontRight,
    live: true,
  },
] as const;

export function ConcertsHero() {
  const t = useTranslations("ConcertsPage");
  const rootRef = useRef<HTMLElement>(null);

  useParallax(rootRef);

  return (
    <header ref={rootRef} className={styles.hero}>
      <div className={styles.stage}>
        {CARDS.map((card) => (
          // The parallax hook overwrites `transform`, so the card's tilt has
          // to sit on an inner element or every frame would erase it.
          <div
            key={card.src}
            data-parallax={card.parallax}
            className={`${styles.card} ${card.className}`}
          >
            <div className={styles.tilt}>
              <SmartImage
                src={card.src}
                alt={t(card.alt)}
                className={styles.photo}
                objectPosition={
                  "objectPosition" in card ? card.objectPosition : undefined
                }
              />
              {"live" in card && (
                <span className={styles.liveTag}>{t("liveTag")}</span>
              )}
            </div>
          </div>
        ))}

        <div className={styles.scrim} aria-hidden />

        <div className={styles.copy}>
          <div className={styles.overline}>{t("overline")}</div>
          <h1 className={styles.title}>{t("title")}</h1>
          <p className={styles.sub}>{t("sub")}</p>
        </div>
      </div>
    </header>
  );
}
