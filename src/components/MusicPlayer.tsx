"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ARTIST, tracks } from "@/content/music";
import styles from "./MusicPlayer.module.scss";

// Floating audio player over the hero: a dark pill carrying a live dot, the
// current track, and a play/pause button. Tracks come from src/content/music.ts
// and are served from our own origin — never a Spotify/YouTube embed, which
// would trip the consent-banner requirement (AGENTS.md).
//
// A single <audio> element is reused across tracks so switching never leaves a
// second one playing. Renders nothing when there are no tracks at all.
export function MusicPlayer() {
  const t = useTranslations("Music");
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [open, setOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const track = tracks[index];
  const playable = Boolean(track?.src);
  const multiple = tracks.length > 1;

  // Switching tracks: load the new source, and keep playing if we already were.
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (!playing) return;
    void el.play().catch(() => setPlaying(false));
  }, [index, playing]);

  // Close the track list on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!track) return null;

  const toggle = () => {
    const el = audioRef.current;
    if (!el || !playable) return;
    if (el.paused) {
      void el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      el.pause();
      setPlaying(false);
    }
  };

  const select = (i: number) => {
    setIndex(i);
    setOpen(false);
    // Let the effect above resume playback on the new source.
    if (!playing) setPlaying(true);
  };

  return (
    <div ref={rootRef} className={styles.root}>
      <div className={styles.pill}>
        <span
          className={`${styles.dot} ${playing ? styles.dotLive : ""}`}
          aria-hidden
        />

        {multiple ? (
          <button
            type="button"
            className={styles.title}
            aria-expanded={open}
            aria-haspopup="listbox"
            onClick={() => setOpen((v) => !v)}
          >
            {track.title} — {ARTIST}
            <span className={styles.caret} aria-hidden />
          </button>
        ) : (
          <span className={styles.titleStatic}>
            {track.title} — {ARTIST}
          </span>
        )}

        <button
          type="button"
          className={styles.play}
          onClick={toggle}
          disabled={!playable}
          aria-label={
            playable ? (playing ? t("pause") : t("play")) : t("unavailable")
          }
          title={playable ? undefined : t("unavailable")}
        >
          {playing ? (
            <svg viewBox="0 0 24 24" aria-hidden>
              <rect x="6" y="5" width="4" height="14" rx="1.2" />
              <rect x="14" y="5" width="4" height="14" rx="1.2" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M8 5.2 19 12 8 18.8 Z" />
            </svg>
          )}
        </button>
      </div>

      {open && multiple && (
        <ul className={styles.list} role="listbox" aria-label={t("tracklist")}>
          {tracks.map((item, i) => (
            <li key={item.title}>
              <button
                type="button"
                role="option"
                aria-selected={i === index}
                className={`${styles.item} ${i === index ? styles.itemOn : ""}`}
                onClick={() => select(i)}
                disabled={!item.src}
              >
                {item.title}
                {!item.src && <span className={styles.soon}>{t("soon")}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}

      <audio
        ref={audioRef}
        src={track.src ?? undefined}
        preload="none"
        onEnded={() => setPlaying(false)}
        onPause={() => setPlaying(false)}
      />
    </div>
  );
}
