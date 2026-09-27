"use client";

import { useEffect, useRef, type ReactNode } from "react";

// Scroll-linked drift for a section partway down a page — the counterpart to
// useParallax, which is built for heroes at the very top.
//
// useParallax offsets layers by the raw window scroll, which only makes sense
// for a root that starts at scroll 0. A section further down needs its own
// progress instead: 0 as it enters at the bottom of the viewport, 1 as it
// leaves off the top. Every `[data-drift]` element inside moves by
// `(0.5 - progress) * amplitude` px, so each layer sits exactly where the
// design put it when the section is centred on screen, and amplitudes are
// written in px of total travel rather than as factors of the scroll.
//
// Listens only while the section is near the viewport, and never under
// prefers-reduced-motion. The drift writes `transform` wholesale, so a layer
// that needs its own tilt or centring must carry it on an inner element.
export function ScrollDrift({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = ref.current;
    if (!root) return;

    const layers = Array.from(
      root.querySelectorAll<HTMLElement>("[data-drift]"),
    ).map((el) => ({ el, amplitude: parseFloat(el.dataset.drift!) }));
    if (!layers.length) return;

    let frame = 0; // rAF ids are always positive, so 0 means "none pending"
    const paint = () => {
      frame = 0;
      const vh = window.innerHeight || 1;
      const { top, height } = root.getBoundingClientRect();
      const progress = Math.min(Math.max((vh - top) / (vh + height), 0), 1);
      for (const { el, amplitude } of layers) {
        const y = ((0.5 - progress) * amplitude).toFixed(2);
        el.style.transform = `translate3d(0, ${y}px, 0)`;
      }
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    let listening = false;
    const listen = (on: boolean) => {
      if (on === listening) return;
      listening = on;
      const method = on ? "addEventListener" : "removeEventListener";
      window[method]("scroll", request, { passive: true });
      window[method]("resize", request);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        listen(entry.isIntersecting);
        // Also tells CSS whether the section is worth animating at all: the
        // stylesheet pauses its own animations while this is absent.
        root.toggleAttribute("data-on-screen", entry.isIntersecting);
        if (entry.isIntersecting) request();
      },
      { rootMargin: "120px" },
    );
    io.observe(root);
    paint();

    return () => {
      io.disconnect();
      listen(false);
      root.removeAttribute("data-on-screen");
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
