"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { IMAGES } from "@/content/assets";
import styles from "./Hero.module.scss";

// Fraction of the remaining distance the rendered offset covers each frame.
// This easing is what a plain scroll-event handler lacks: applying the raw
// scroll position makes the layers step with every wheel tick.
//
// It is deliberately high. The smoothing is only there to absorb the coarse
// steps of a wheel tick, NOT to add float: at 0.45 the layers are ~95% settled
// about five frames after you stop, so there is no drift-after-stop — which is
// what reads as "bounce" when scrolling back up. Lowering this reintroduces it.
const EASE = 0.15;
// Sub-pixel remainder nobody can see — snap and let the loop stop.
const SETTLE_PX = 0.01;
// How much the title recedes and fades over one hero's worth of scrolling.
// Translation alone just moves the title further; shrinking and fading it as
// it travels is what reads as depth. Kept subtle — enough to sell distance,
// not so much that the title looks like it is animating on its own.
const TITLE_SCALE_LOSS = 0.07;
const TITLE_FADE = 0.4;

// Layered parallax hero from the design: forest photo depth stack, giant
// ÕTEKSE title, wheat-field foreground. Each [data-parallax] layer shifts by
// offset * its factor, where offset eases toward the scroll position inside a
// rAF loop. The loop parks itself once motion settles and while the hero is
// off-screen. Disabled entirely under prefers-reduced-motion.
export function Hero() {
  const t = useTranslations("Home");
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = rootRef.current;
    if (!root) return;

    const layers = Array.from(
      root.querySelectorAll<HTMLElement>("[data-parallax]"),
    ).map((el) => ({
      el,
      factor: parseFloat(el.dataset.parallax!),
      isTitle: el.dataset.heroTitle !== undefined,
    }));

    let rendered = window.scrollY;
    let target = rendered;
    let frame = 0; // rAF ids are always positive, so 0 means "none pending"
    let onScreen = true;
    let heroHeight = root.offsetHeight || 1; // cached: reading it per frame forces reflow

    const paint = () => {
      const progress = Math.min(Math.max(rendered / heroHeight, 0), 1);
      for (const { el, factor, isTitle } of layers) {
        const y = (rendered * factor).toFixed(2);
        if (isTitle) {
          const scale = 1 - progress * TITLE_SCALE_LOSS;
          el.style.transform = `translate3d(0, ${y}px, 0) scale(${scale.toFixed(4)})`;
          el.style.opacity = (1 - progress * TITLE_FADE).toFixed(3);
        } else {
          el.style.transform = `translate3d(0, ${y}px, 0)`;
        }
      }
    };

    const tick = () => {
      frame = 0;
      const gap = target - rendered;
      rendered = Math.abs(gap) < SETTLE_PX ? target : rendered + gap * EASE;
      paint();
      if (rendered !== target) frame = requestAnimationFrame(tick);
    };
    const request = () => {
      if (!frame && onScreen) frame = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      target = window.scrollY;
      request();
    };
    const onResize = () => {
      heroHeight = root.offsetHeight || 1;
      request();
    };

    // Nothing to animate once the hero has scrolled away; snap on re-entry so
    // coming back doesn't play a catch-up slide from a stale offset.
    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen) {
          rendered = target = window.scrollY;
          paint();
        } else if (frame) {
          cancelAnimationFrame(frame);
          frame = 0;
        }
      },
      { rootMargin: "120px" },
    );
    io.observe(root);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    paint();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      io.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const forest = `url('${IMAGES.forest}')`;
  const wheat = `url('${IMAGES.wheat}')`;

  return (
    <header ref={rootRef} className={styles.hero}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={IMAGES.forest} alt="" data-parallax="0.65" className={styles.base} />

      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
        <defs>
          <clipPath id="hero-wave-a" clipPathUnits="objectBoundingBox">
            <path d="M0,0.28 C0.08,0.1 0.18,0.04 0.3,0.1 C0.42,0.16 0.5,0.02 0.62,0.06 C0.74,0.1 0.8,0.26 0.9,0.22 C0.95,0.2 0.98,0.12 1,0.1 L1,1 L0,1 Z" />
          </clipPath>
          <clipPath id="hero-wave-b" clipPathUnits="objectBoundingBox">
            <path d="M0,0.1 C0.06,0.22 0.16,0.28 0.28,0.2 C0.4,0.12 0.48,0.3 0.6,0.26 C0.72,0.22 0.78,0.04 0.88,0.08 C0.94,0.11 0.98,0.2 1,0.18 L1,1 L0,1 Z" />
          </clipPath>
          <clipPath id="hero-wave-c" clipPathUnits="objectBoundingBox">
            <path d="M0,0.22 C0.1,0.06 0.2,0.16 0.32,0.12 C0.46,0.07 0.52,0.24 0.66,0.18 C0.78,0.13 0.86,0.02 1,0.12 L1,1 L0,1 Z" />
          </clipPath>
          <clipPath id="hero-wave-wheat" clipPathUnits="objectBoundingBox">
            <path d="M0,0.3 C0.1,0.16 0.22,0.12 0.36,0.18 C0.5,0.24 0.62,0.14 0.74,0.09 C0.84,0.05 0.93,0.02 1,0.02 L1,1 L0,1 Z" />
          </clipPath>
          <clipPath id="hero-wave-wheat2" clipPathUnits="objectBoundingBox">
            <path d="M0,0.06 C0.1,0.02 0.22,0.08 0.34,0.15 C0.48,0.23 0.6,0.18 0.72,0.23 C0.83,0.27 0.93,0.24 1,0.3 L1,1 L0,1 Z" />
          </clipPath>
        </defs>
      </svg>

      <div data-parallax="0.5" className={`${styles.layer} ${styles.layerA}`}>
        <div
          className={styles.layerFill}
          style={{ backgroundImage: forest, clipPath: "url(#hero-wave-a)" }}
        />
      </div>
      <div data-parallax="0.34" className={`${styles.layer} ${styles.layerB}`}>
        <div
          className={styles.layerFill}
          style={{ backgroundImage: forest, clipPath: "url(#hero-wave-b)" }}
        />
      </div>
      <div data-parallax="0.2" className={`${styles.layer} ${styles.layerC}`}>
        <div
          className={styles.layerFill}
          style={{ backgroundImage: forest, clipPath: "url(#hero-wave-c)" }}
        />
      </div>

      <div className={styles.vignette} />

      <h1 data-parallax="0.6" data-hero-title className={styles.title}>
        ÕTEKSE
      </h1>

      <div data-parallax="0.22" className={styles.wheatFar}>
        <div
          className={styles.layerFill}
          style={{ backgroundImage: wheat, clipPath: "url(#hero-wave-wheat)" }}
        />
      </div>

      <div data-parallax="0.06" className={styles.wheatNear}>
        <div
          className={styles.layerFill}
          style={{ backgroundImage: wheat, clipPath: "url(#hero-wave-wheat2)" }}
        />
        {IMAGES.girlsCutout && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={IMAGES.girlsCutout} alt={t("heroAlt")} className={styles.cutout} />
        )}
      </div>
    </header>
  );
}
