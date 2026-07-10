"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { members, type MemberPalette } from "@/content/members";
import { SmartImage } from "@/components/SmartImage";
import styles from "./MembersSection.module.scss";

const paletteClass: Record<MemberPalette, string> = {
  gold: styles.paletteGold,
  rust: styles.paletteRust,
  pine: styles.palettePine,
};

// Radial fill origin per member column (matches the design's circle centers).
const FILL_CX = ["16.7%", "50%", "83.3%"];

export function MembersSection() {
  const t = useTranslations("Members");
  const locale = useLocale() as "et" | "en";
  const [selected, setSelected] = useState(0);
  const [previous, setPrevious] = useState(0);
  // Bumped on every pick so the radiating overlay remounts and replays its
  // animation — even when re-selecting the member that was shown last.
  const [pickCount, setPickCount] = useState(0);

  const pick = (i: number) => {
    if (i === selected) return;
    setPrevious(selected);
    setSelected(i);
    setPickCount((n) => n + 1);
  };

  const sel = members[selected];

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.overline}>— {t("overline")}</div>
        <h2 className={styles.title}>{t("title")}</h2>

        <div className={styles.panel}>
          {/* Backdrop: the previously-selected colour, so the incoming colour
              radiates over it rather than over the bare paper surface. */}
          <div
            className={`${styles.fillBase} ${paletteClass[members[previous].palette]}`}
          />
          {/* Overlay: the selected colour, radiating out from its column.
              Keyed on pickCount so it replays on every selection. */}
          <div
            key={pickCount}
            className={`${styles.fillRadiate} ${paletteClass[sel.palette]}`}
            style={{ ["--fill-cx" as string]: FILL_CX[selected] }}
          />

          <div className={`${styles.content} ${paletteClass[sel.palette]}`}>
            <div className={styles.grid}>
              {members.map((m, i) => {
                const active = i === selected;
                return (
                  <div key={m.name} className={styles.memberCol}>
                    <div
                      className={`${styles.avatar} ${active ? styles.avatarActive : styles.avatarInactive}`}
                    >
                      <SmartImage
                        src={m.photo}
                        alt={t("photoPlaceholder", { name: m.name })}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => pick(i)}
                      aria-pressed={active}
                      className={`${styles.nameBtn} ${active ? styles.nameBtnActive : ""}`}
                    >
                      {m.name}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className={styles.detail}>
              <h3 className={styles.detailName}>{sel.name}</h3>
              <div className={styles.detailFacts}>
                <div>
                  <span className={styles.detailLabel}>{t("locLabel")}:</span> {sel.loc}
                </div>
                <div>
                  <span className={styles.detailLabel}>{t("jobLabel")}:</span>{" "}
                  {sel.job[locale]}
                </div>
                <div>
                  <span className={styles.detailLabel}>{t("hobbyLabel")}:</span>{" "}
                  {sel.hobby[locale]}
                </div>
              </div>
              <p className={styles.detailQuote}>“{sel.quote[locale]}”</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
