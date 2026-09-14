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
// The frame is 8:9. The file is 16:9 and mixes upright phone clips, whose
// black bars are baked into the picture, with wide landscape shots. At the
// owner's call there are no bars: the video is drawn at the size where an
// upright clip's own footage spans the frame's width, centred, and pinned to
// the bottom, so the part that does not fit is cut off at the top. Wide clips
// show their middle third.
//
// That video box is about three times wider than the frame, so the browser's
// own controls — laid out across the box — would sit outside the frame, cut
// off. The frame carries its own small bar instead (play/pause, seek, mute,
// full screen), and clicking the picture plays or pauses. In full screen the
// browser shows the whole picture with its native controls.
//
// Until pressed it shows our poster (a frame of the video) and a play button,
// with `preload="none"`: loading the page never downloads the ~6 MB file, only
// pressing play does.

function formatTime(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function AlbumVideo() {
  const t = useTranslations("Album");
  const video = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    const sync = () => {
      setPlaying(!el.paused && !el.ended);
      setMuted(el.muted);
      setTime(el.currentTime);
      if (Number.isFinite(el.duration)) setDuration(el.duration);
    };
    const onFullscreen = () => setFullscreen(document.fullscreenElement === el);
    const events = ["play", "pause", "ended", "timeupdate", "loadedmetadata", "volumechange"];
    events.forEach((e) => el.addEventListener(e, sync));
    document.addEventListener("fullscreenchange", onFullscreen);
    return () => {
      events.forEach((e) => el.removeEventListener(e, sync));
      document.removeEventListener("fullscreenchange", onFullscreen);
    };
  }, []);

  const start = () => {
    setStarted(true);
    void video.current?.play();
  };

  const togglePlay = () => {
    const el = video.current;
    if (!el) return;
    if (el.paused || el.ended) void el.play();
    else el.pause();
  };

  const toggleMute = () => {
    const el = video.current;
    if (el) el.muted = !el.muted;
  };

  const enterFullscreen = () => {
    const el = video.current as
      | (HTMLVideoElement & { webkitEnterFullscreen?: () => void })
      | null;
    if (!el) return;
    if (el.requestFullscreen) void el.requestFullscreen();
    else el.webkitEnterFullscreen?.(); // iOS Safari: its own full-screen player
  };

  return (
    <div className={styles.frame} data-started={started ? "" : undefined}>
      <video
        ref={video}
        className={styles.video}
        src={VIDEOS.hooandja}
        poster={IMAGES.albumVideoPoster}
        preload="none"
        playsInline
        // Native controls only in full screen, where the whole picture shows.
        controls={fullscreen}
        aria-label={t("videoTitle")}
      />

      {!started ? (
        <button
          type="button"
          className={styles.start}
          aria-label={t("videoPlay")}
          onClick={start}
        >
          <span className={styles.play} aria-hidden />
        </button>
      ) : (
        <>
          <button
            type="button"
            className={styles.toggle}
            aria-label={playing ? t("videoPause") : t("videoPlay")}
            onClick={togglePlay}
          />
          <div className={styles.bar}>
            <button
              type="button"
              className={styles.ctrl}
              aria-label={playing ? t("videoPause") : t("videoPlay")}
              onClick={togglePlay}
            >
              {playing ? (
                <svg viewBox="0 0 24 24" aria-hidden>
                  <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden>
                  <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
                </svg>
              )}
            </button>

            <input
              type="range"
              className={styles.seek}
              min={0}
              max={duration || 0}
              step={0.1}
              value={Math.min(time, duration || 0)}
              aria-label={t("videoSeek")}
              aria-valuetext={`${formatTime(time)} / ${formatTime(duration)}`}
              onChange={(e) => {
                const el = video.current;
                if (el) el.currentTime = Number(e.target.value);
              }}
            />
            <span className={styles.time} aria-hidden>
              {formatTime(time)}
            </span>

            <button
              type="button"
              className={styles.ctrl}
              aria-label={muted ? t("videoUnmute") : t("videoMute")}
              aria-pressed={muted}
              onClick={toggleMute}
            >
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" />
                {muted ? (
                  <path
                    d="M15.5 9.5l5 5m0-5l-5 5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                ) : (
                  <path
                    d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />
                )}
              </svg>
            </button>

            <button
              type="button"
              className={styles.ctrl}
              aria-label={t("videoFullscreen")}
              onClick={enterFullscreen}
            >
              <svg viewBox="0 0 24 24" aria-hidden>
                <path
                  d="M4.5 9V4.5H9M15 4.5h4.5V9M19.5 15v4.5H15M9 19.5H4.5V15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
