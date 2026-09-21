// The band's contact address: shown on the privacy page and the shop, and the
// address every shop order is emailed to (see lib/order-email.ts).
//
// Kept in lib/, outside the AI-editable content directory, on purpose: where
// orders go is not something a content edit should be able to change.
export const CONTACT_EMAIL = "otekse@gmail.com";

/**
 * Where the band is on the web, in the order they are shown in the footer.
 *
 * Here rather than in `content/` for the same reason as the address above: a
 * link that carries the band's identity is not something a content edit should
 * be able to repoint.
 *
 * The URLs are stripped of the query strings they were copied with — Spotify's
 * `?si=` share token and Facebook's `?locale=`, both of which describe whoever
 * copied the link rather than the band.
 */
export const SOCIAL_LINKS = [
  { name: "Instagram", url: "https://www.instagram.com/kolm_ode_otekse/" },
  {
    name: "Spotify",
    url: "https://open.spotify.com/artist/1WSymfv0BjfvTTvUP0k4lS",
  },
  {
    name: "Facebook",
    url: "https://www.facebook.com/p/K%C3%A4tlin-ja-Mirjam-100063689935154/",
  },
  { name: "YouTube", url: "https://www.youtube.com/@mirjamkits" },
] as const;

export type SocialName = (typeof SOCIAL_LINKS)[number]["name"];
