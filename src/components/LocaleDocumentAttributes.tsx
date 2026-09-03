"use client";

import { useEffect } from "react";

// The document shell is intentionally above `[locale]` so locale switches can
// stay client-side. Keep the HTML language attribute in sync after navigation.
export function LocaleDocumentAttributes({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
