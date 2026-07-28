"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { ARTIST, tracks } from "@/content/music";
import styles from "./MusicPlayer.module.scss";

/** The Hero renders this element; on phones the player moves into it. */
export const HERO_PLAYER_SLOT = "hero-player-slot";

// Below this the nav has no room for the player, so it goes back to the middle
// of the hero banner where there is space for the track name.
const HERO_PLACEMENT = "(max-width: 899.98px)";

// useLayoutEffect runs before paint (so the player never flashes in the nav
// first) but warns during SSR, where layout does not exist.
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

// Audio player: a pill carrying a live dot, the current track, and a
// play/pause button. Tracks come from src/content/music.ts and are served from
// our own origin — never a Spotify/YouTube embed, which would trip the
// consent-banner requirement (AGENTS.md).
//
// Placement is responsive. On desktop it sits in the nav, so it is reachable
// from every page. On phones the nav cannot fit it, so it moves into the
// middle of the hero banner in its glass treatment — rendered through a portal
// rather than mounted twice, so there is only ever one <audio> element and one
// piece of playback state. Pages without a hero keep the nav placement.
//
// A single <audio> element is reused across tracks so switching never leaves a
// second one playing. Renders nothing when there are no tracks at all.
export function MusicPlayer() {
  const t = useTranslations("Music");
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [open, setOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [heroSlot, setHeroSlot] = useState<HTMLElement | null>(null);

  // Re-evaluate on resize so rotating a phone moves the player to the right
  // place instead of stranding it.
  useIsomorphicLayoutEffect(() => {
    const mq = window.matchMedia(HERO_PLACEMENT);
    const apply = () =>
      setHeroSlot(
        mq.matches ? document.getElementById(HERO_PLAYER_SLOT) : null,
      );
    apply();
    mq.addEventListener("change", apply);
    window.addEventListener("resize", apply);
    return () => {
      mq.removeEventListener("change", apply);
      window.removeEventListener("resize", apply);
    };
  }, []);

  const track = tracks[index];
  const playable = Boolean(track?.src);
  const multiple = tracks.length > 1;
  const startAt = track?.startAt ?? 0;

  // Seek past a slow intro. Guarded on readyState because seeking before
  // metadata has loaded is silently ignored; onLoadedMetadata covers that case.
  const seekToStart = (el: HTMLAudioElement) => {
    if (startAt > 0 && el.currentTime < startAt) el.currentTime = startAt;
  };

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
      seekToStart(el);
      // Flip the icon immediately. The track is several megabytes, so on a
      // slow connection play() can take seconds to produce sound — without
      // instant feedback the button reads as broken.
      setPlaying(true);
      if (el.readyState < 3) setBuffering(true);
      void el.play().catch((err: DOMException) => {
        // AbortError just means a newer play()/pause() superseded this one —
        // not a failure, and not a reason to contradict the UI.
        if (err.name !== 'AbortError') {
          setPlaying(false);
          setBuffering(false);
        }
      });
    } else {
      el.pause();
      setPlaying(false);
      setBuffering(false);
    }
  };

  const select = (i: number) => {
    setIndex(i);
    setOpen(false);
    // Let the effect above resume playback on the new source.
    if (!playing) setPlaying(true);
  };

  const ui = (
    <div
      ref={rootRef}
      className={`${styles.root} ${heroSlot ? styles.inHero : styles.inNav}`}
    >
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

        {/* The nav has no room for the track name on a phone, so the list gets
            its own control there — otherwise switching tracks would be
            unreachable on mobile. */}
        {multiple && (
          <button
            type="button"
            className={styles.listBtn}
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-label={t("tracklist")}
            onClick={() => setOpen((v) => !v)}
          >
            <span className={styles.caret} aria-hidden />
          </button>
        )}

        <button
          type="button"
          className={styles.play}
          onClick={toggle}
          disabled={!playable}
          aria-label={
            playable
              ? buffering
                ? t("loading")
                : playing
                  ? t("pause")
                  : t("play")
              : t("unavailable")
          }
          title={playable ? undefined : t("unavailable")}
        >
          {buffering ? (
            <span className={styles.spinner} aria-hidden />
          ) : playing ? (
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
        // "metadata" not "none": it fetches enough to know the duration and
        // warms the connection, so the first press starts far sooner. The
        // audio body itself still is not downloaded until play.
        preload="metadata"
        onLoadedMetadata={(e) => seekToStart(e.currentTarget)}
        onEnded={(e) => {
          setPlaying(false);
          // Rewind to the offset, not to 0, so a replay skips the intro too.
          e.currentTarget.currentTime = startAt;
        }}
        onPause={() => setPlaying(false)}
        onWaiting={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
        onCanPlay={() => setBuffering(false)}
        onError={() => {
          setPlaying(false);
          setBuffering(false);
        }}
      />
    </div>
  );

  return heroSlot ? createPortal(ui, heroSlot) : ui;
}
