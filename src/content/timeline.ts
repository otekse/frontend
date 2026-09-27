// Binds the editable timeline data to its validator — same arrangement as
// concerts.ts next door.
//
// The entries live in `timeline.json` (inert data the runtime orchestrator may
// edit); the rules that check it live in `@/lib/timeline`, outside this
// directory, and run here at import time so bad data fails `next build`.
//
// To add something the band did, edit timeline.json. Photos go through
// `npm run images:build` from assets-src/timeline/.

import { parseTimeline, type TimelineYear } from "@/lib/timeline";
import raw from "./timeline.json";

export const timeline: TimelineYear[] = parseTimeline(raw);
