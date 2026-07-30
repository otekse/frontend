"use client";

import { useEffect, useRef, type RefObject } from "react";

// Shared scroll-parallax loop for the layered heroes (home, concerts).
//
// Every `[data-parallax]` element inside the root shifts by
// `offset * its factor`, where `offset` eases toward the scroll position
// inside a rAF loop. The loop parks itself once motion settles and while the
// root is off-screen, and never starts at all under prefers-reduced-motion.

// Fraction of the remaining distance the rendered offset covers each frame.
// This easing is what a plain scroll-event handler lacks: applying the raw
// scroll position makes the layers step with every wheel tick.
//
// It is deliberately high. The smoothing is only there to absorb the coarse
// steps of a wheel tick, NOT to add float: at 0.15 the layers are ~95% settled
// about five frames after you stop, so there is no drift-after-stop — which is
// what reads as "bounce" when scrolling back up. Lowering this reintroduces it.
const EASE = 0.15;
// Sub-pixel remainder nobody can see — snap and let the loop stop.
const SETTLE_PX = 0.01;

/**
 * Positions one layer for the current frame.
 *
 * @param el      the `[data-parallax]` element
 * @param y       its parallax offset in px (scroll offset * the layer factor)
 * @param progress how far the root has scrolled through its own height, 0–1
 */
export type PaintLayer = (
  el: HTMLElement,
  y: number,
  progress: number,
) => void;

const translateOnly: PaintLayer = (el, y) => {
  el.style.transform = `translate3d(0, ${y}px, 0)`;
};

export function useParallax(
  rootRef: RefObject<HTMLElement | null>,
  paintLayer: PaintLayer = translateOnly,
) {
  // The painter is typically an inline arrow, so it is deliberately kept out
  // of the loop effect's dependencies: re-running that effect on every render
  // would tear down and rebuild the rAF loop mid-scroll. Held in a ref that is
  // refreshed after paint instead, so the loop always calls the current one.
  const paintRef = useRef(paintLayer);
  useEffect(() => {
    paintRef.current = paintLayer;
  });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = rootRef.current;
    if (!root) return;

    // Stand down where CSS can do this better. A root marked `data-css-parallax`
    // ships scroll-timeline rules for its own layers (see Hero.module.scss), and
    // those run on the compositor: no scroll listener, no rAF, nothing on the
    // main thread that can fall behind the scroll. Running both would mean two
    // writers fighting over `transform`.
    //
    // Opt-in per root rather than global, because a root only gets to skip the
    // JS if it actually carries the equivalent CSS — the concerts hero does not,
    // so it keeps this loop.
    //
    // Shipped in Chrome/Edge 115 and Safari 26; older Safari falls through to
    // the loop below, which is why it stays.
    if (
      root.hasAttribute("data-css-parallax") &&
      CSS.supports("animation-timeline: scroll()")
    ) {
      return;
    }

    const layers = Array.from(
      root.querySelectorAll<HTMLElement>("[data-parallax]"),
    ).map((el) => ({ el, factor: parseFloat(el.dataset.parallax!) }));
    if (!layers.length) return;

    let rendered = window.scrollY;
    let target = rendered;
    let frame = 0; // rAF ids are always positive, so 0 means "none pending"
    let onScreen = true;
    let rootHeight = root.offsetHeight || 1; // cached: reading it per frame forces reflow

    const paint = () => {
      const progress = Math.min(Math.max(rendered / rootHeight, 0), 1);
      for (const { el, factor } of layers) {
        paintRef.current(el, +(rendered * factor).toFixed(2), progress);
      }
    };

    const tick = () => {
      frame = 0;
      const gap = target - rendered;
      rendered = Math.abs(gap) < SETTLE_PX ? target : rendered + gap * EASE;
      paint();
      if (rendered !== target) frame = requestAnimationFrame(tick);
    };
    const request = () => {
      if (!frame && onScreen) frame = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      target = window.scrollY;
      request();
    };
    const onResize = () => {
      rootHeight = root.offsetHeight || 1;
      request();
    };

    // Nothing to animate once the root has scrolled away; snap on re-entry so
    // coming back doesn't play a catch-up slide from a stale offset.
    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen) {
          rendered = target = window.scrollY;
          paint();
        } else if (frame) {
          cancelAnimationFrame(frame);
          frame = 0;
        }
      },
      { rootMargin: "120px" },
    );
    io.observe(root);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    paint();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      io.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [rootRef]);
}
