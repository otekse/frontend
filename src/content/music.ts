// The homepage music player's tracklist — editable content, like concerts and
// members (see AGENTS.md "Conventions" → editable content collections).
//
// Audio is served from our own origin on purpose. Embedding Spotify or YouTube
// would set third-party cookies and make a consent banner legally required
// (AGENTS.md "Analytics and privacy" → consent tripwire), so keep audio local.
//
// To add a track: drop the audio file in `public/audio/` and add a row here. A
// row with `src: null` renders in the list but cannot be played — useful for
// announcing a song before the file exists.
//
// Audio lives in `public/` rather than `assets-src/`, unlike images: there is
// no optimisation pass to run, so the delivered file *is* the original.
//
// Format note: WebM/Opus plays in Chrome, Edge and Firefox, and in Safari from
// 15 (macOS) / 17.4 (iOS). Adding an MP3 sibling would cover older Safari —
// see the AGENTS.md note on audio formats.
export type Track = {
  title: string;
  /** Path under public/, or null while the audio file is still missing. */
  src: string | null;
  /**
   * Seconds to skip at the start, for recordings that open with a long
   * fade-in or room tone. Playback begins here and returns here when the
   * track ends.
   *
   * Done as a playback offset rather than by trimming the file: it needs no
   * re-encoding (which would cost a generation of quality), keeps the master
   * intact, and can be re-tuned by editing this number.
   */
  startAt?: number;
};

export const tracks: Track[] = [
  { title: "Unt aia taga", src: "/audio/unt-aia-taga.webm", startAt: 3 },
  { title: "Armastuse rohi", src: "/audio/armastuse-rohi.webm" },
];

/** Shown next to the track title in the player pill. */
export const ARTIST = "Õtekse";
