import {
  HOOANDJA_CAMPAIGN_URL,
  parseCampaignProgress,
  type CampaignProgress,
} from "@/lib/hooandja";

// Fetches the campaign's progress for the homepage album section.
//
// Called while the homepage renders on our server — at build, then at most
// hourly through the root layout's `revalidate` — so a visitor's browser never
// contacts Hooandja: no third-party request, nothing for the privacy policy or
// a consent banner. Hooandja sees one request an hour from our server.
//
// Fails soft on every path. A slow, down or redesigned Hooandja page, or a
// build with no network, returns null: the section then shows the Hooandja
// button without figures, and the page still renders.

const TIMEOUT_MS = 5000;

export async function getCampaignProgress(): Promise<CampaignProgress | null> {
  try {
    const res = await fetch(`${HOOANDJA_CAMPAIGN_URL}/view/general`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return parseCampaignProgress(await res.text());
  } catch {
    return null;
  }
}
