import type { ReactNode } from "react";
import { SOCIAL_LINKS, type SocialName } from "@/lib/contact";
import styles from "./SocialLinks.module.scss";

// The marks are drawn here rather than pasted from the platforms' brand kits:
// same 24×24 box and 1.8px stroke as the globe in LocaleSwitcher, so a row of
// them reads as one set in our own hand instead of four foreign logos. Each
// draws in `currentColor`, so the link below owns the colour.
const ICONS: Record<SocialName, ReactNode> = {
  Instagram: (
    <>
      <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5.2" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="16.9" cy="7.1" r="1.05" fill="currentColor" stroke="none" />
    </>
  ),
  Spotify: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M6.5 9.3c3.4-1.1 7.5-.6 10.8 1.3" />
      <path d="M7.6 12.5c2.8-.9 6.2-.5 8.9 1.1" />
      <path d="M8.7 15.6c2.2-.7 4.8-.4 6.9.9" />
    </>
  ),
  Facebook: (
    <>
      <circle cx="12" cy="12" r="9" />
      {/* The f: stem down to where the circle closes under it. */}
      <path d="M14.8 8.1h-1.5a2.2 2.2 0 0 0-2.2 2.2V21" />
      <path d="M9.4 13.4h5" />
    </>
  ),
  YouTube: (
    <>
      <rect x="2.6" y="5.8" width="18.8" height="12.4" rx="4" />
      <path d="M10.4 9.3 15.8 12l-5.4 2.7Z" fill="currentColor" />
    </>
  ),
};

/**
 * The band's profiles as a row of icon links.
 *
 * Icon-only, so each link carries the platform name as its accessible name and
 * the list carries a label of its own — four unlabelled marks in a row are
 * exactly the case where a screen reader has nothing else to go on.
 */
export function SocialLinks({ label }: { label: string }) {
  return (
    <ul className={styles.list} aria-label={label}>
      {SOCIAL_LINKS.map((social) => (
        <li key={social.name}>
          <a
            href={social.url}
            target="_blank"
            rel="noreferrer"
            aria-label={social.name}
            className={styles.link}
          >
            <svg
              className={styles.icon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              {ICONS[social.name]}
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
