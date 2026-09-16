"use client";

import { useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { IMAGES } from "@/content/assets";
import styles from "./AlbumButton.module.scss";

// The header's "Uus album!" button. On page load it opens once into a card
// showing a still of the album section, holds, and closes back to the pill —
// a trailer for the section it links to.
//
// The opening is imperative, written as px sizes on the element, because the
// pill's natural size is `auto` and a CSS transition cannot run from or to
// `auto`. It measures the pill, pins that size, animates to the card size and
// back, then clears every inline style so the pill returns to plain layout.
//
// It waits for the still to decode, so a card never opens onto an empty frame;
// it never runs under prefers-reduced-motion; and it plays once per page load —
// the header survives client-side navigation, so moving between pages or
// switching language does not replay it.

const START_DELAY_MS = 700; // after the hero's own entrance
const OPEN_MS = 450; // keep equal to --duration-album-card in globals.css
const HOLD_MS = 2400; // fully open
const PREVIEW_RATIO = 1307 / 687; // the still's aspect ratio (scripts/optimize-images.mjs)
const MAX_CARD_W = 420;
const EDGE_GAP = 16; // clearance from the viewport edge and the neighbouring controls
const INSET = 8; // the still's inset inside the card; matches .preview in the stylesheet
const CARD_RADIUS = 18;

export function AlbumButton() {
  const t = useTranslations("Album");
  const locale = useLocale() as "et" | "en";
  const pathname = usePathname();
  const ref = useRef<HTMLAnchorElement>(null);
  const preview = IMAGES.albumPreview[locale];
  // The trailer plays once, in the language the page loaded in; a later
  // language switch changes the still for next time but must not replay it.
  const firstPreview = useRef(preview);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const pill = ref.current;
    const slot = pill?.parentElement;
    if (!pill || !slot) return;

    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => {
      timers.push(window.setTimeout(fn, ms));
    };
    let cancelled = false;

    // How wide the card may open. Centred in the bar (wide screens), its top
    // row must not reach over the links or the player; on its own row below
    // the nav (narrow screens) only the viewport limits it.
    const cardWidth = () => {
      let room = window.innerWidth - EDGE_GAP * 2;
      const nav = pill.closest("nav");
      if (nav && getComputedStyle(slot).position === "absolute") {
        const center = nav.getBoundingClientRect().width / 2;
        const links = nav
          .querySelector("[data-primary-nav]")
          ?.getBoundingClientRect();
        const group = slot.nextElementSibling?.getBoundingClientRect();
        if (links && group) {
          room = Math.min(
            room,
            2 * Math.min(center - links.right, group.left - center) - EDGE_GAP * 2,
          );
        }
      }
      return Math.min(MAX_CARD_W, room);
    };

    const setSize = (w: number, h: number, radius: number) => {
      pill.style.width = `${w}px`;
      pill.style.height = `${h}px`;
      pill.style.borderRadius = `${radius}px`;
    };

    const clear = () => {
      pill.removeAttribute("data-open");
      for (const p of ["width", "height", "border-radius", "--label-h"]) {
        pill.style.removeProperty(p);
      }
      slot.style.removeProperty("height");
    };

    const open = () => {
      const { width: w0, height: h0 } = pill.getBoundingClientRect();
      const w = cardWidth();
      if (w <= w0) return; // no room to open into: stay a button
      const h = h0 + (w - INSET * 2) / PREVIEW_RATIO + INSET;

      // The slot keeps the pill's height, so the card grows down out of the
      // bar rather than pushing the nav open or growing up past the top edge.
      slot.style.height = `${h0}px`;
      pill.style.setProperty("--label-h", `${h0}px`);
      // Pin the current size so the transition has a starting point, commit
      // it with a reflow, then set the target.
      setSize(w0, h0, h0 / 2);
      void pill.offsetWidth;
      pill.setAttribute("data-open", "");
      setSize(w, h, CARD_RADIUS);

      later(() => {
        pill.removeAttribute("data-open");
        setSize(w0, h0, h0 / 2);
        later(clear, OPEN_MS);
      }, OPEN_MS + HOLD_MS);
    };

    const still = new Image();
    still.src = firstPreview.current;
    still.decode().then(
      () => {
        if (!cancelled) later(open, START_DELAY_MS);
      },
      () => {}, // the still will not load: no trailer, the button stays a button
    );

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      clear();
    };
  }, []);

  return (
    <div className={styles.slot}>
      <Link
        ref={ref}
        href={{ pathname: "/", hash: "album" }}
        className={styles.pill}
        onClick={(event) => {
          // Already on the homepage: scroll there directly. A link to the hash
          // the page is already on would not move at all. scrollIntoView honours
          // the section's scroll-margin (0), so its cream top edge meets the top
          // of the viewport. From other pages the link navigates as usual.
          const section = document.getElementById("album");
          if (pathname !== "/" || !section) return;
          event.preventDefault();
          const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          section.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
        }}
      >
        <span className={styles.label}>{t("navButton")}</span>
        <span className={styles.preview} aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="" decoding="async" />
        </span>
      </Link>
    </div>
  );
}
