import { serializeJsonLd } from "@/lib/structured-data";

// Structured data for search engines (lib/structured-data.ts). A plain
// <script>, not next/script: JSON-LD is data, not code to load.
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
