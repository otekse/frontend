"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { IMAGES, VIDEOS } from "@/content/assets";
import styles from "./AlbumVideo.module.scss";

// The Hooandja campaign video, standing where the album section had its cover.
//
// Served from our own server, so playing it contacts no third party: no
// consent question, and nothing extra for the privacy policy.
//
// The file is 16:9 but mixes two kinds of clip: upright phone footage with
// black bars baked in either side, and genuinely wide landscape shots. No one
// shape shows both without bars or cropping, so the picture follows the clip.
// The card keeps an upright 9:16 space — the concerts below never move — and
// the picture box inside it animates between filling that space (upright
// clips, drawn with `object-fit: cover`, which crops exactly the baked-in bars
// away) and a centred 16:9 box on the card's paper (wide clips, shown whole).
//
// Which kind is on screen is read from the video itself, not a list of
// timestamps, so a replacement video keeps working: a few times a second a
// tiny copy of the current frame is checked for anything lit in its outer
// bands, where an upright clip is always black. The file is same-origin, which
// is what lets the canvas read it.
//
// Until pressed it shows our poster (a frame of the upright footage) and a
// play button, with `preload="none"`: loading the page never downloads the
// ~6 MB file, only pressing play does.

// Frame sampling. 48x27 keeps the check trivially cheap; the outer 30% on each
// side is well clear of the upright strip, which spans the middle 31.6%.
const SAMPLE_W = 48;
const SAMPLE_H = 27;
const BAND = Math.floor(SAMPLE_W * 0.3);
/** Summed RGB of a column's brightest pixel above which it counts as picture. */
const LIT = 60;
const SAMPLE_MS = 250;
/** Consecutive agreeing samples before switching, so a crossfade cannot flicker it. */
const AGREE = 2;

export function AlbumVideo() {
  const t = useTranslations("Album");
  const video = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [wide, setWide] = useState(false);

  useEffect(() => {
    const el = video.current;
    if (!started || !el) return;

    const canvas = document.createElement("canvas");
    canvas.width = SAMPLE_W;
    canvas.height = SAMPLE_H;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let current = false;
    let pending: boolean | null = null;
    let streak = 0;
    let timer = 0;

    const isWideFrame = (): boolean | null => {
      if (el.readyState < 2) return null;
      try {
        ctx.drawImage(el, 0, 0, SAMPLE_W, SAMPLE_H);
        const d = ctx.getImageData(0, 0, SAMPLE_W, SAMPLE_H).data;
        for (let x = 0; x < SAMPLE_W; x++) {
          if (x >= BAND && x < SAMPLE_W - BAND) continue;
          for (let y = 0; y < SAMPLE_H; y++) {
            const i = (y * SAMPLE_W + x) * 4;
            if (d[i] + d[i + 1] + d[i + 2] > LIT) return true;
          }
        }
        return false;
      } catch {
        // An unreadable (cross-origin) frame: stay as we are.
        return null;
      }
    };

    const sample = (immediate = false) => {
      const next = isWideFrame();
      if (next === null) return;
      if (next === current) {
        pending = null;
        streak = 0;
        return;
      }
      streak = next === pending ? streak + 1 : 1;
      pending = next;
      if (immediate || streak >= AGREE) {
        current = next;
        pending = null;
        streak = 0;
        setWide(next);
      }
    };

    const start = () => {
      window.clearInterval(timer);
      timer = window.setInterval(() => sample(), SAMPLE_MS);
    };
    const stop = () => window.clearInterval(timer);
    // After a seek the new frame is simply the truth: no need to wait for agreement.
    const onSeeked = () => sample(true);

    el.addEventListener("play", start);
    el.addEventListener("pause", stop);
    el.addEventListener("ended", stop);
    el.addEventListener("seeked", onSeeked);
    if (!el.paused) start();

    return () => {
      stop();
      el.removeEventListener("play", start);
      el.removeEventListener("pause", stop);
      el.removeEventListener("ended", stop);
      el.removeEventListener("seeked", onSeeked);
    };
  }, [started]);

  return (
    <div className={styles.frame} data-wide={wide ? "" : undefined}>
      <div className={styles.screen}>
        <video
          ref={video}
          className={styles.video}
          src={VIDEOS.hooandja}
          poster={IMAGES.albumVideoPoster}
          preload="none"
          playsInline
          controls={started}
          aria-label={t("videoTitle")}
        />
      </div>
      {!started && (
        <button
          type="button"
          className={styles.start}
          aria-label={t("videoPlay")}
          onClick={() => {
            setStarted(true);
            void video.current?.play();
          }}
        >
          <span className={styles.play} aria-hidden />
        </button>
      )}
    </div>
  );
}
