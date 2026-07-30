"use client";

import { useRef, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { IMAGES } from "@/content/assets";
import { HERO_PLAYER_SLOT } from "@/components/MusicPlayer";
import { useParallax } from "@/lib/use-parallax";
import styles from "./Hero.module.scss";

// How much the title recedes and fades over one hero's worth of scrolling.
// Translation alone just moves the title further; shrinking and fading it as
// it travels is what reads as depth. Kept subtle — enough to sell distance,
// not so much that the title looks like it is animating on its own.
const TITLE_SCALE_LOSS = 0.07;
const TITLE_FADE = 0.4;

// One drift factor per layer, consumed by both paths: the CSS scroll timeline
// reads `--parallax`, the JS fallback reads `data-parallax`. Emitting them from
// a single call keeps the two from drifting apart.
function drift(factor: number) {
  return {
    "data-parallax": factor,
    style: { "--parallax": factor } as CSSProperties,
  };
}

// Layered parallax hero from the design: forest photo depth stack, giant
// ÕTEKSE title, wheat-field foreground. The scroll loop itself lives in
// useParallax (shared with the concerts hero); all this adds is the title's
// recede-and-fade, which no other hero has.
export function Hero() {
  const t = useTranslations("Home");
  const rootRef = useRef<HTMLElement>(null);

  useParallax(rootRef, (el, y, progress) => {
    if (el.dataset.heroTitle === undefined) {
      el.style.transform = `translate3d(0, ${y}px, 0)`;
      return;
    }
    const scale = 1 - progress * TITLE_SCALE_LOSS;
    el.style.transform = `translate3d(0, ${y}px, 0) scale(${scale.toFixed(4)})`;
    el.style.opacity = (1 - progress * TITLE_FADE).toFixed(3);
  });

  const forest = `url('${IMAGES.forest}')`;
  const wheat = `url('${IMAGES.wheat}')`;

  return (
    // `data-css-parallax` tells useParallax to stand down where the browser can
    // run this off the main thread; the two title constants above are handed to
    // CSS here so the scroll-timeline path cannot disagree with the JS one.
    <header
      ref={rootRef}
      className={styles.hero}
      data-css-parallax
      style={
        {
          "--title-scale-end": 1 - TITLE_SCALE_LOSS,
          "--title-opacity-end": 1 - TITLE_FADE,
        } as CSSProperties
      }
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={IMAGES.forest} alt="" {...drift(0.65)} className={styles.base} />

      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
        <defs>
          <clipPath id="hero-wave-a" clipPathUnits="objectBoundingBox">
            <path d="M0,0.28 C0.08,0.1 0.18,0.04 0.3,0.1 C0.42,0.16 0.5,0.02 0.62,0.06 C0.74,0.1 0.8,0.26 0.9,0.22 C0.95,0.2 0.98,0.12 1,0.1 L1,1 L0,1 Z" />
          </clipPath>
          <clipPath id="hero-wave-b" clipPathUnits="objectBoundingBox">
            <path d="M0,0.1 C0.06,0.22 0.16,0.28 0.28,0.2 C0.4,0.12 0.48,0.3 0.6,0.26 C0.72,0.22 0.78,0.04 0.88,0.08 C0.94,0.11 0.98,0.2 1,0.18 L1,1 L0,1 Z" />
          </clipPath>
          <clipPath id="hero-wave-wheat" clipPathUnits="objectBoundingBox">
            <path d="M0,0.3 C0.1,0.16 0.22,0.12 0.36,0.18 C0.5,0.24 0.62,0.14 0.74,0.09 C0.84,0.05 0.93,0.02 1,0.02 L1,1 L0,1 Z" />
          </clipPath>
          <clipPath id="hero-wave-wheat2" clipPathUnits="objectBoundingBox">
            <path d="M0,0.06 C0.1,0.02 0.22,0.08 0.34,0.15 C0.48,0.23 0.6,0.18 0.72,0.23 C0.83,0.27 0.93,0.24 1,0.3 L1,1 L0,1 Z" />
          </clipPath>
        </defs>
      </svg>

      <div {...drift(0.5)} className={`${styles.layer} ${styles.layerA}`}>
        <div
          className={styles.layerFill}
          style={{ backgroundImage: forest, clipPath: "url(#hero-wave-a)" }}
        />
      </div>
      <div {...drift(0.34)} className={`${styles.layer} ${styles.layerB}`}>
        <div
          className={styles.layerFill}
          style={{ backgroundImage: forest, clipPath: "url(#hero-wave-b)" }}
        />
      </div>
      <div className={styles.vignette} />

      <h1 {...drift(0.6)} data-hero-title className={styles.title}>
        ÕTEKSE
      </h1>

      <div {...drift(0.22)} className={styles.wheatFar}>
        <div
          className={styles.layerFill}
          style={{ backgroundImage: wheat, clipPath: "url(#hero-wave-wheat)" }}
        />
      </div>

      <div {...drift(0.06)} className={styles.wheatNear}>
        <div
          className={styles.layerFill}
          style={{ backgroundImage: wheat, clipPath: "url(#hero-wave-wheat2)" }}
        />
        {IMAGES.girlsCutout && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={IMAGES.girlsCutout} alt={t("heroAlt")} className={styles.cutout} />
        )}
      </div>

      {/* On phones the player portals into here. Outside the parallax layers
          on purpose — a control that drifts while you reach for it is
          hostile. Empty and invisible on desktop, where the player stays in
          the nav. */}
      <div id={HERO_PLAYER_SLOT} className={styles.playerSlot} />
    </header>
  );
}
