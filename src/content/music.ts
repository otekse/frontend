// The homepage music player's tracklist — editable content, like concerts and
// members (see AGENTS.md "Conventions" → editable content collections).
//
// Audio is served from our own origin on purpose. Embedding Spotify or YouTube
// would set third-party cookies and make a consent banner legally required
// (AGENTS.md "Analytics and privacy" → consent tripwire), so keep audio local.
//
// To add a track: drop the MP3 in `public/audio/` and add a row here. A row
// with `src: null` renders in the list but cannot be played — useful for
// announcing a song before the file exists.
export type Track = {
  title: string;
  /** Path under public/, or null while the audio file is still missing. */
  src: string | null;
};

export const tracks: Track[] = [
  { title: "Hunt Aja Taga", src: null },
  { title: "Puraviku polka", src: null },
];

/** Shown next to the track title in the player pill. */
export const ARTIST = "Õtekse";
