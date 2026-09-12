"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./HomeReveal.module.scss";

type HomeRevealProps = {
  children: ReactNode;
};

// Progressive enhancement: sections remain visible in the server-rendered
// page. The observer adds the fade only after JavaScript is available.
export function HomeReveal({ children }: HomeRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const frame = window.requestAnimationFrame(() => {
      element.dataset.reveal = "pending";
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          element.dataset.reveal = "visible";
          observer.disconnect();
        },
        { threshold: 0.1 },
      );
      observer.observe(element);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div ref={ref} className={styles.reveal}>
      {children}
    </div>
  );
}
