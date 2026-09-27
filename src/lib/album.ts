// When the "Rannapiigad" promotion is hidden.
//
// The homepage album section and the header's "Uus album!" button are shown
// only before this date (in Tallinn). From it on they are hidden from visitors,
// not removed: the section, the button and their content all stay in the code,
// and moving this date shows them again. Nobody has to remember to hide them
// either — the root layout revalidates hourly, so the first render after
// midnight on the end date leaves both out, without a deploy.
//
// Pure and clock-free so the tests drive it directly — callers pass today's
// date, from `todayInTallinn()` in lib/concerts.

/** The first day the promotion is hidden, as YYYY-MM-DD. */
export const ALBUM_PROMO_ENDS = "2027-01-01";

export function albumPromoActive(today: string): boolean {
  // ISO dates compare correctly as strings.
  return today < ALBUM_PROMO_ENDS;
}
