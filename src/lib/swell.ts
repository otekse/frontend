// Seamless swell paths for the album section's sea (AlbumSection).
//
// Each swell strip is twice the section wide and slides left by exactly half
// its width per loop, so a path has to repeat exactly every LOOP units of its
// STRIP-wide viewBox. Otherwise the shape at the loop point differs from the
// start and the sea visibly jumps each time the animation restarts — which
// the export's hand-drawn paths did. So the paths are generated: a smooth,
// sine-like swell repeating every `period` (which must divide LOOP), shifted
// by `phase` so the layers' crests do not line up.
//
// Pure, so the tests can prove the repeat instead of trusting it.

export const STRIP = 2400;
export const LOOP = STRIP / 2;
/** The viewBox height: every swell is filled down to it. */
const FLOOR = 220;

// Coordinates are rounded to hundredths. `1200 * 0.18` is 216.00000000000003
// in floating point; unrounded, the paths carry that noise, and the two halves
// of a join stop being exact mirror images of each other.
const r = (v: number) => Math.round(v * 100) / 100;

export function swellPath(
  period: number,
  mid: number,
  depth: number,
  phase: number,
): string {
  if (LOOP % period !== 0) {
    throw new Error(`swell period ${period} must divide ${LOOP}, or the loop jumps`);
  }

  const top = r(mid - depth);
  const bottom = r(mid + depth);

  // Two cubic segments per period, a crest then a trough. Their control points
  // mirror across every join, so the curve stays smooth where segments meet.
  // A cubic only reaches three quarters of the way to its control points, so
  // the visible rise is 0.75 * depth.
  let x = -phase;
  let d = `M${x},${mid}`;
  for (; x < STRIP; x += period) {
    d +=
      ` C${r(x + period * 0.18)},${top} ${r(x + period * 0.32)},${top} ${r(x + period / 2)},${mid}` +
      ` C${r(x + period * 0.68)},${bottom} ${r(x + period * 0.82)},${bottom} ${r(x + period)},${mid}`;
  }
  return `${d} L${x},${FLOOR} L${-phase},${FLOOR} Z`;
}
