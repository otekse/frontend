"use client";

import { useId, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { pastConcerts } from "@/content/concerts";
import styles from "./PastConcerts.module.scss";

// The archive behind the "Vaata eelnevaid" toggle. Collapsed by default —
// upcoming dates are what people come for.
export function PastConcerts() {
  const t = useTranslations("ConcertsPage");
  const locale = useLocale() as "et" | "en";
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className={styles.toggle}
      >
        <span>{t(open ? "pastHide" : "pastShow")}</span>
        <span className={`${styles.caret} ${open ? styles.caretOpen : ""}`} aria-hidden>
          ⌄
        </span>
      </button>

      {/* Collapsed via grid-template-rows 0fr -> 1fr rather than a fixed
          max-height: the panel animates to whatever it actually measures, so
          adding a seventh concert can never clip the list. */}
      <div id={panelId} className={`${styles.panel} ${open ? styles.panelOpen : ""}`}>
        <div className={styles.panelInner}>
          {/* The toggle already labels this list on screen, so the heading is
              here for document structure only. */}
          <h2 className="sr-only">{t("pastHeading")}</h2>
          {pastConcerts.map((c) => (
            <div key={`${c.date.et}-${c.title.et}`} className={styles.row}>
              <div className={styles.date}>{c.date[locale]}</div>
              <div>
                <div className={styles.name}>{c.title[locale]}</div>
                <div className={styles.info}>{c.info[locale]}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
