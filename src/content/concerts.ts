// Binds the editable concert data to its validator.
//
// The concerts themselves live in `concerts.json` — inert data, so an edit by
// the runtime orchestrator can never introduce executable code. The rules that
// check that file live in `@/lib/concerts` (outside this AI-editable
// directory), and run here at import time: invalid data throws during
// `next build` rather than reaching the site.
//
// To change a concert, edit concerts.json. Nothing needs changing here, and
// nothing is sorted or filed by hand — see `splitConcerts`.

import { parseConcerts, type Concert } from "@/lib/concerts";
import raw from "./concerts.json";

export const concerts: Concert[] = parseConcerts(raw);
