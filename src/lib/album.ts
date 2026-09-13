// When the "Rannapiigad" promotion comes down.
//
// Both the homepage album section and the header's "Uus album!" button are
// shown only before this date (in Tallinn). Nobody has to remember to remove
// them: the root layout revalidates hourly, so the first render after
// midnight on the end date drops both, without a deploy.
//
// Pure and clock-free so the tests drive it directly — callers pass today's
// date, from `todayInTallinn()` in lib/concerts.

/** The first day the promotion is no longer shown, as YYYY-MM-DD. */
export const ALBUM_PROMO_ENDS = "2027-01-01";

export function albumPromoActive(today: string): boolean {
  // ISO dates compare correctly as strings.
  return today < ALBUM_PROMO_ENDS;
}
