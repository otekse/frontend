"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./SmartImage.module.scss";

// Content image with design-system loading/missing states:
//  - while loading: sand surface with a cream shimmer skeleton
//  - missing src or failed load: sand surface with a quiet wheat mark
// Use this for any content image (products, photos); decorative CSS
// backgrounds (hero layers, wheat waves) don't need it.
export function SmartImage({
  src,
  alt,
  className,
  objectPosition,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  objectPosition?: string;
}) {
  const [state, setState] = useState<"loading" | "loaded" | "error">(
    src ? "loading" : "error",
  );
  const imgRef = useRef<HTMLImageElement>(null);

  // If the image was already complete before hydration (cache hit), onLoad
  // never fires — reconcile from the DOM.
  useEffect(() => {
    const el = imgRef.current;
    if (el?.complete) {
      setState(el.naturalWidth > 0 ? "loaded" : "error");
    }
  }, []);

  return (
    <div className={`${styles.frame} ${className ?? ""}`}>
      {src && state !== "error" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={`${styles.img} ${state === "loaded" ? styles.imgLoaded : ""}`}
          style={objectPosition ? { objectPosition } : undefined}
          onLoad={() => setState("loaded")}
          onError={() => setState("error")}
        />
      )}

      {state === "loading" && <div className={styles.skeleton} aria-hidden />}

      {state === "error" && (
        <div className={styles.missing} role="img" aria-label={alt}>
          <svg viewBox="0 0 48 64" fill="none" aria-hidden>
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
        </div>
      )}
    </div>
  );
}
