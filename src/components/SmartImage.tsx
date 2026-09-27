"use client";

import { useEffect, useRef, useState } from "react";
import { srcSetFor } from "@/content/assets";
import { WheatMark } from "./WheatMark";
import styles from "./SmartImage.module.scss";

// Content image with design-system loading/missing states:
//  - while loading: sand surface with a cream shimmer skeleton
//  - missing src or failed load: sand surface with a quiet wheat mark
// Use this for any content image (products, photos); decorative CSS
// backgrounds (hero layers, wheat waves) don't need it.
//
// `loading="lazy"` is for long image lists (the About timeline): the browser
// then fetches nothing until the image nears the viewport, and nothing at all
// inside a closed <details>.
//
// `sizes` describes how wide the image renders, in the same shape as the CSS
// that lays it out. Pass it for any of our own images: it is what lets the
// browser choose a narrow file out of the srcset, and without it the browser
// assumes the whole viewport and takes the widest one there is.
export function SmartImage({
  src,
  alt,
  className,
  objectPosition,
  loading,
  sizes,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  objectPosition?: string;
  loading?: "lazy" | "eager";
  sizes?: string;
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
    // Spans rather than divs: this renders inside a <button> in the members
    // section, and a button may only contain phrasing content.
    <span className={`${styles.frame} ${className ?? ""}`}>
      {src && state !== "error" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={src}
          srcSet={srcSetFor(src)}
          sizes={sizes}
          alt={alt}
          loading={loading}
          className={`${styles.img} ${state === "loaded" ? styles.imgLoaded : ""}`}
          style={objectPosition ? { objectPosition } : undefined}
          onLoad={() => setState("loaded")}
          onError={() => setState("error")}
        />
      )}

      {state === "loading" && <span className={styles.skeleton} aria-hidden />}

      {state === "error" && (
        <span className={styles.missing} role="img" aria-label={alt}>
          <WheatMark />
        </span>
      )}
    </span>
  );
}
