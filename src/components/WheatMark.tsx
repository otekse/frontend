// The wheat-ear mark: the project's standing-in graphic wherever a real image
// is absent — a missing/failed content image (SmartImage) or a section that
// deliberately has nothing to show yet (ShopClosed).
//
// Draws in `currentColor` and fills its box, so callers control colour and
// size from CSS. Decorative by default; pass a `title` where the mark carries
// meaning on its own and the caller isn't already labelling it.
export function WheatMark({
  className,
  title,
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 48 64"
      fill="none"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <path
        d="M24 62 C25 46 23 34 24 18"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <g fill="currentColor">
        <ellipse cx="24" cy="14" rx="4" ry="9" />
        <ellipse cx="15" cy="24" rx="3.5" ry="8" transform="rotate(-24 15 24)" />
        <ellipse cx="33" cy="24" rx="3.5" ry="8" transform="rotate(24 33 24)" />
        <ellipse cx="14" cy="38" rx="3.5" ry="8" transform="rotate(-28 14 38)" />
        <ellipse cx="34" cy="38" rx="3.5" ry="8" transform="rotate(28 34 38)" />
      </g>
    </svg>
  );
}
