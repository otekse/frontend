import { useId } from "react";
import { IMAGES } from "@/content/assets";
import styles from "./WheatWave.module.scss";

// Wheat-textured section divider from the design. Two shapes:
//  - "wave": clipped wavy top edge (shop hero → products transition)
//  - "curve": soft double-curve bottom edge (homepage → concerts transition)
export function WheatWave({
  variant,
  height,
}: {
  variant: "wave" | "curve";
  height: number;
}) {
  const clipId = useId().replace(/:/g, "");

  return (
    <div
      aria-hidden
      className={`${styles.strip} ${variant === "wave" ? styles.wave : styles.curve}`}
      style={{ height }}
    >
      {variant === "wave" && (
        <svg width="0" height="0" style={{ position: "absolute" }}>
          <defs>
            <clipPath id={clipId} clipPathUnits="objectBoundingBox">
              <path d="M0,0.35 C0.1,0.15 0.24,0.1 0.38,0.2 C0.52,0.3 0.64,0.12 0.76,0.1 C0.86,0.08 0.94,0.16 1,0.12 L1,1 L0,1 Z" />
            </clipPath>
          </defs>
        </svg>
      )}
      <div
        className={styles.fill}
        style={{
          backgroundImage: `url('${IMAGES.wheat}')`,
          ...(variant === "wave" ? { clipPath: `url(#${clipId})` } : {}),
        }}
      />
    </div>
  );
}
