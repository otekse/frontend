"use client";

import { useEffect, useRef, type ReactNode } from "react";

// The timeline's scroll motion — "Tõus" (rise), the default of the three the
// Claude Design export lets you try.
//
// Each `[data-entry]` rises 30px and fades up from 15% as it climbs from 90%
// of the viewport height to about 56%; its `[data-fig]` photos rise from
// further down (78px, then 30px more per photo) and scale up from 90%, so
// they arrive just after their text.
//
// Measured on the entry, moved on its `[data-rise]` child: measuring the
// element being translated would feed the offset back into its own progress.
// Listens only while the timeline is near the viewport, and never under
// prefers-reduced-motion, where everything simply stays in place.
export function TimelineRise({
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

    const entries = Array.from(
      root.querySelectorAll<HTMLElement>("[data-entry]"),
    ).map((el) => ({
      el,
      rise: el.querySelector<HTMLElement>("[data-rise]"),
      figs: Array.from(el.querySelectorAll<HTMLElement>("[data-fig]")),
    }));
    if (!entries.length) return;

    let frame = 0; // rAF ids are always positive, so 0 means "none pending"
    const paint = () => {
      frame = 0;
      const vh = window.innerHeight || 1;
      // Read every position before writing any style, so the loop never
      // forces a style recalculation per entry.
      const tops = entries.map(({ el }) => el.getBoundingClientRect().top);

      entries.forEach(({ rise, figs }, i) => {
        const e = Math.min(Math.max((vh * 0.9 - tops[i]) / (vh * 0.34), 0), 1);
        const done = e === 1;
        if (rise) {
          rise.style.opacity = done ? "" : (0.15 + 0.85 * e).toFixed(3);
          rise.style.transform = done
            ? ""
            : `translate3d(0, ${((1 - e) * 30).toFixed(1)}px, 0)`;
        }
        figs.forEach((f, n) => {
          f.style.opacity = done ? "" : e.toFixed(3);
          f.style.transform = done
            ? ""
            : `translate3d(0, ${((1 - e) * (78 + n * 30)).toFixed(1)}px, 0) scale(${(0.9 + 0.1 * e).toFixed(3)})`;
        });
      });
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
        if (entry.isIntersecting) request();
      },
      { rootMargin: "200px" },
    );
    io.observe(root);
    paint();

    return () => {
      io.disconnect();
      listen(false);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
