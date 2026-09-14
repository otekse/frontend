"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { IMAGES, VIDEOS } from "@/content/assets";
import styles from "./AlbumVideo.module.scss";

// The Hooandja campaign video, standing where the album section had its cover.
//
// Served from our own server, so playing it contacts no third party: no
// consent question, and nothing extra for the privacy policy.
//
// The frame is 8:9, one fixed shape: the column's width and twice the height
// of a 16:9 frame. The file is 16:9 and mixes upright phone clips, with black
// bars baked in either side, and wide landscape shots. With `object-fit:
// cover` the picture fills the frame by height, so the upright clips show at
// twice their 16:9 size with only slim bars left, and the wide clips show their
// middle half. Both
// the owner's calls: a card that changed shape per clip looked worse, and a
// taller card that kept the whole picture left the upright clips just as small.
//
// Until pressed it shows our poster (a frame of the video) and a play button,
// with `preload="none"`: loading the page never downloads the ~6 MB file, only
// pressing play does.
export function AlbumVideo() {
  const t = useTranslations("Album");
  const video = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  return (
    <div className={styles.frame}>
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
