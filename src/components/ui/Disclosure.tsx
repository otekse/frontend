import type { ReactNode } from "react";
import styles from "./Disclosure.module.scss";

// The site's expand/collapse bar, shared by the About accordion on the
// homepage and the archive at the foot of the concerts page.
//
// Native <details> rather than a JS accordion: it is keyboard- and
// screen-reader-accessible for free, works with JS disabled, and keeps both
// callers server components.
//
// `tone` is the only axis of variation — the same bar on a light surface
// (About, on cream) and on a dark one (the archive, on forest). It lives on
// the group because it describes the surface underneath, and the items read it
// through inherited custom properties; a Disclosure therefore always belongs
// inside a DisclosureGroup, even when it is the only one.

type Tone = "ink" | "cream";

export function DisclosureGroup({
  children,
  tone = "ink",
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <div className={`${styles.group} ${styles[tone]} ${className}`.trim()}>
      {children}
    </div>
  );
}

// `summary` takes heading content as well as plain text — <summary>'s content
// model allows a heading, which lets a caller keep the document outline
// without a duplicate sr-only copy.
export function Disclosure({
  summary,
  children,
  defaultOpen = false,
}: {
  summary: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details className={styles.item} open={defaultOpen}>
      <summary className={styles.summary}>
        {summary}
        <span className={styles.marker} aria-hidden />
      </summary>
      {/* A wrapper with no styling of its own: it is the animation target for
          browsers that cannot transition ::details-content. */}
      <div className={styles.body}>{children}</div>
    </details>
  );
}
