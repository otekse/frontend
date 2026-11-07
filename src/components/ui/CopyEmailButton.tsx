"use client";

import { useEffect, useRef, useState } from "react";

// A button that copies an email address instead of opening a mail app, which
// many visitors don't have set up. It shows the address itself, so it can
// still be read and typed by hand, and confirms the copy for a moment.
export function CopyEmailButton({
  email,
  copyLabel,
  copiedLabel,
  className,
}: {
  email: string;
  /** Accessible name, e.g. "Copy the email address". */
  copyLabel: string;
  /** Shown briefly after copying, and announced to screen readers. */
  copiedLabel: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      // No Clipboard API (an http page, an older browser): select the text in
      // a throwaway field and use the legacy copy command.
      const field = document.createElement("textarea");
      field.value = email;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      document.execCommand("copy");
      field.remove();
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2500);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={className}
      aria-label={`${copyLabel}: ${email}`}
      data-copied={copied || undefined}
    >
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        {copied ? (
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        ) : (
          <>
            <rect x="9" y="9" width="11" height="11" rx="2" />
            <path d="M5 15V5a1 1 0 0 1 1-1h10" />
          </>
        )}
      </svg>
      <span>{copied ? copiedLabel : email}</span>
      <span role="status" className="sr-only">
        {copied ? copiedLabel : ""}
      </span>
    </button>
  );
}
