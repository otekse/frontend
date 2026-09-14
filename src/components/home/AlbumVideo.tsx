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
// The frame is 16:9, the file's own shape. The video mixes wide landscape
// shots, which fill it, with upright phone clips that carry black bars baked
// in either side, which show as they are. A card that changed shape with each
// clip was tried and dropped at the owner's call: the card resizing mid-video
// looked worse than the bars.
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
