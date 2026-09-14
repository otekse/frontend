"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { IMAGES } from "@/content/assets";
import { SmartImage } from "@/components/SmartImage";
import styles from "./AlbumVideo.module.scss";

// The Hooandja campaign video, standing where the album section had its cover.
//
// Click to play, on purpose. Until a visitor presses play this is our own
// poster image and a button, and nothing is requested from Vimeo. A player
// that loads with the page contacts Vimeo for every visitor, which would make
// a consent banner legally required (AGENTS.md, "Consent tripwire"). Pressing
// play is the visitor choosing to load it, and the player then runs with
// Vimeo's do-not-track setting (`dnt=1`: no session tracking or cookies from
// the player itself). Keep it click-to-play.

const VIMEO_ID = "1224596187";
/** The unlisted video's privacy hash, required to play it. */
const VIMEO_HASH = "c413929569";
const PLAYER_URL =
  `https://player.vimeo.com/video/${VIMEO_ID}` +
  `?h=${VIMEO_HASH}&dnt=1&autoplay=1&title=0&byline=0&portrait=0`;

export function AlbumVideo() {
  const t = useTranslations("Album");
  const [playing, setPlaying] = useState(false);

  return (
    <div className={styles.frame}>
      {playing ? (
        <iframe
          src={PLAYER_URL}
          title={t("videoTitle")}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className={styles.player}
        />
      ) : (
        <button
          type="button"
          className={styles.poster}
          onClick={() => setPlaying(true)}
          aria-label={t("videoPlay")}
        >
          {/* The button names it; the still itself adds nothing to read out. */}
          <SmartImage src={IMAGES.albumVideoPoster} alt="" />
          <span className={styles.play} aria-hidden />
        </button>
      )}
    </div>
  );
}
