"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { IMAGES } from "@/content/assets";
import styles from "./Hero.module.scss";

// Layered parallax hero from the design: forest photo depth stack, giant
// ÕTEKSE title, wheat-field foreground. Parallax factors per layer come from
// the design; scrolling shifts each by scrollY * factor via one rAF handler.
// Disabled entirely under prefers-reduced-motion.
export function Hero() {
  const t = useTranslations("Home");
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const layers = Array.from(
      rootRef.current?.querySelectorAll<HTMLElement>("[data-parallax]") ?? [],
    );
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        for (const el of layers) {
          el.style.transform = `translateY(${(y * parseFloat(el.dataset.parallax!)).toFixed(1)}px)`;
        }
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const forest = `url('${IMAGES.forest}')`;
  const wheat = `url('${IMAGES.wheat}')`;

  return (
    <header ref={rootRef} className={styles.hero}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={IMAGES.forest} alt="" data-parallax="0.5" className={styles.base} />

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

      <div data-parallax="0.38" className={`${styles.layer} ${styles.layerA}`}>
        <div
          className={styles.layerFill}
          style={{ backgroundImage: forest, clipPath: "url(#hero-wave-a)" }}
        />
      </div>
      <div data-parallax="0.26" className={`${styles.layer} ${styles.layerB}`}>
        <div
          className={styles.layerFill}
          style={{ backgroundImage: forest, clipPath: "url(#hero-wave-b)" }}
        />
      </div>
      <div data-parallax="0.15" className={`${styles.layer} ${styles.layerC}`}>
        <div
          className={styles.layerFill}
          style={{ backgroundImage: forest, clipPath: "url(#hero-wave-c)" }}
        />
      </div>

      <div className={styles.vignette} />

      <h1 data-parallax="0.42" className={styles.title}>
        ÕTEKSE
      </h1>

      <div data-parallax="0.15" className={styles.wheatFar}>
        <div
          className={styles.layerFill}
          style={{ backgroundImage: wheat, clipPath: "url(#hero-wave-wheat)" }}
        />
      </div>

      <div className={styles.wheatNear}>
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
