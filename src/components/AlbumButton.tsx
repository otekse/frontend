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
// The card is a separate overlay on top of the pill, revealed by animating its
// `clip-path` outwards from the pill's own outline. The pill itself never
// changes size, which is the point: growing it moved its edges on every frame
// and counted as layout shift — 0.076 on a phone, nearly all of the homepage's
// CLS.
//
// The still is drawn into a <canvas> rather than shown in an <img>, because an
// <img> that size became the page's Largest Contentful Paint: a decoration that
// opens a second after hydration was deciding when the homepage counted as
// loaded (11.4s on a throttled phone). A canvas is not an LCP candidate, so the
// measurement follows the hero again.
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
const INSET = 8; // the still's inset inside the card; matches .still in the stylesheet
const MAX_DPR = 2; // drawing a phone's 3x in full costs more than it shows

export function AlbumButton() {
  const t = useTranslations("Album");
  const locale = useLocale() as "et" | "en";
  const pathname = usePathname();
  const pillRef = useRef<HTMLAnchorElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // The trailer plays once, in the language the page loaded in; a later
  // language switch changes the still for next time but must not replay it.
  const firstPreview = useRef(IMAGES.albumPreview[locale]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const pill = pillRef.current;
    const canvas = canvasRef.current;
    const slot = pill?.parentElement;
    if (!pill || !canvas || !slot) return;

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

    // The still, drawn at device resolution and cropped like `object-fit:
    // cover` — the canvas has no such property of its own.
    const paintStill = (image: HTMLImageElement, w: number, h: number) => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      const ctx = canvas.getContext("2d");
      if (!ctx) return false;
      const scale = Math.max(
        canvas.width / image.naturalWidth,
        canvas.height / image.naturalHeight,
      );
      const drawW = image.naturalWidth * scale;
      const drawH = image.naturalHeight * scale;
      ctx.drawImage(
        image,
        (canvas.width - drawW) / 2,
        (canvas.height - drawH) / 2,
        drawW,
        drawH,
      );
      return true;
    };

    const clear = () => {
      pill.removeAttribute("data-trailer");
      for (const p of ["--pill-h", "--card-w", "--card-h"]) {
        pill.style.removeProperty(p);
      }
    };

    const open = (image: HTMLImageElement) => {
      const { width: pillW, height: pillH } = pill.getBoundingClientRect();
      const cardW = cardWidth();
      if (cardW <= pillW) return; // no room to open into: stay a button
      const stillW = cardW - INSET * 2;
      const stillH = stillW / PREVIEW_RATIO;
      if (!paintStill(image, stillW, stillH)) return;

      // The stylesheet builds both clip shapes out of these: the card is
      // centred on the pill, so only the pill's height is needed to place the
      // closed outline.
      pill.style.setProperty("--pill-h", `${pillH}px`);
      pill.style.setProperty("--card-w", `${cardW}px`);
      pill.style.setProperty("--card-h", `${pillH + stillH + INSET}px`);

      // Show the card clipped to the pill's own outline, commit that with a
      // reflow, then let it grow.
      pill.dataset.trailer = "closed";
      void pill.offsetWidth;
      pill.dataset.trailer = "open";

      later(() => {
        pill.dataset.trailer = "closed";
        later(clear, OPEN_MS);
      }, OPEN_MS + HOLD_MS);
    };

    const still = new Image();
    still.src = firstPreview.current;
    still.decode().then(
      () => {
        if (!cancelled) later(() => open(still), START_DELAY_MS);
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
        ref={pillRef}
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

        {/* The trailer. Hidden until the script sizes it, and a copy of the
            pill's own face while closed, so the reveal starts from what is
            already on screen. */}
        <span className={styles.card} aria-hidden>
          <span className={styles.cardLabel}>{t("navButton")}</span>
          <canvas ref={canvasRef} className={styles.still} />
        </span>
      </Link>
    </div>
  );
}
