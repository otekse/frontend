"use client";

import { useRef, type CSSProperties } from "react";
import { preload } from "react-dom";
import { useTranslations } from "next-intl";
import { IMAGES, srcSetFor } from "@/content/assets";
import { HERO_PLAYER_SLOT } from "@/components/MusicPlayer";
import { useParallax } from "@/lib/use-parallax";
import styles from "./Hero.module.scss";

// How much the title recedes and fades over one hero's worth of scrolling.
// Translation alone just moves the title further; shrinking and fading it as
// it travels is what reads as depth. Kept subtle — enough to sell distance,
// not so much that the title looks like it is animating on its own.
const TITLE_SCALE_LOSS = 0.07;
const TITLE_FADE = 0.4;

// The two wheat bands' drift factors. Named because the near one is shared:
// the girls' cutout rides that band and must move at exactly its rate. The far
// band has to stay above the near one and below the nearest forest (.layerB),
// or the depth order inverts.
const FAR_GRAIN_DRIFT = 0.28;
const NEAR_GRAIN_DRIFT = 0.1;

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
  // Held in a const rather than spread inline, so the base's drift factor is
  // still written once even though this layer merges its own background in.
  const baseDrift = drift(0.65);

  // The base forest stopped being an `<img>` when it had to start tiling, which
  // also took it out of reach of the preload scanner. This puts it back in the
  // document head so discovery is not deferred until the CSS has parsed.
  preload(IMAGES.forest, { as: "image", fetchPriority: "high" });

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
      {/* The base forest is a background, not an `<img>`, because only a
          background can tile — see the tree-scale note in the stylesheet. The
          `preload` above restores the early discovery an `<img>` would have
          given it for free. */}
      <div
        {...baseDrift}
        className={styles.base}
        style={{ ...baseDrift.style, backgroundImage: forest }}
      />

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

      <div {...drift(0.56)} className={`${styles.layer} ${styles.layerA}`}>
        <div
          className={styles.layerFill}
          style={{ backgroundImage: forest, clipPath: "url(#hero-wave-a)" }}
        />
      </div>
      <div {...drift(0.4)} className={`${styles.layer} ${styles.layerB}`}>
        <div
          className={styles.layerFill}
          style={{ backgroundImage: forest, clipPath: "url(#hero-wave-b)" }}
        />
      </div>
      <div className={styles.vignette} />

      <h1 {...drift(0.6)} data-hero-title className={styles.title}>
        ÕTEKSE
      </h1>

      <div {...drift(FAR_GRAIN_DRIFT)} className={styles.wheatFar}>
        <div
          className={styles.layerFill}
          style={{ backgroundImage: wheat, clipPath: "url(#hero-wave-wheat)" }}
        />
      </div>

      {IMAGES.girlsCutout && (
        // Pinned to the NEAR wheat: the wrapper carries `NEAR_GRAIN_DRIFT`, the
        // same factor as .wheatNear below, so the group travels with that band
        // and has no motion of its own.
        //
        // It is the near band and not the far one because that is the grain
        // their feet are actually in — the group spans roughly 43–83% of the
        // hero, so the feet sit below .wheatNear's top edge while .wheatFar's
        // edge crosses their waists. Drifting at the far band's rate against
        // ground that moves at the near band's makes them sink through it as
        // you scroll.
        //
        // The drift has to sit on a wrapper rather than on the image, because
        // both the CSS `hero-drift` keyframe and useParallax assign `transform`
        // wholesale — on the image itself they would overwrite the centring and
        // the design's tilt. Same split the wheat bands use (.layerFill).
        <div {...drift(NEAR_GRAIN_DRIFT)} className={styles.cutoutLayer}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={IMAGES.girlsCutout}
            srcSet={srcSetFor(IMAGES.girlsCutout)}
            sizes="(min-width: 909px) 545px, 60vw"
            alt={t("heroAlt")}
            className={styles.cutout}
          />
        </div>
      )}

      <div {...drift(NEAR_GRAIN_DRIFT)} className={styles.wheatNear}>
        <div
          className={styles.layerFill}
          style={{ backgroundImage: wheat, clipPath: "url(#hero-wave-wheat2)" }}
        />
      </div>

      {/* On phones the player portals into here. Outside the parallax layers
          on purpose — a control that drifts while you reach for it is
          hostile. Empty and invisible on desktop, where the player stays in
          the nav. */}
      <div id={HERO_PLAYER_SLOT} className={styles.playerSlot} />
    </header>
  );
}
