// Pulls the backend OpenAPI spec into this repo as the committed snapshot
// (openapi.json) that Orval generates the client from. See AGENTS.md
// "API client (Orval)".
//
// Real workflow (a human, with the backend reachable):
//   API_SPEC_URL=https://api.õtekse.ee/docs-json npm run spec:pull
// Local default (backend checked out as a sibling): copies ../backend/openapi.json.
//
// After pulling, run `npm run api:generate` and commit both openapi.json and
// the regenerated src/api/generated output together.
import { writeFileSync, copyFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '..', 'openapi.json');
const specUrl = process.env.API_SPEC_URL;

if (specUrl) {
  const res = await fetch(specUrl);
  if (!res.ok) {
    console.error(`Failed to fetch spec from ${specUrl}: ${res.status}`);
    process.exit(1);
  }
  const json = await res.json();
  writeFileSync(out, JSON.stringify(json, null, 2) + '\n');
  console.log(`Pulled spec from ${specUrl} -> openapi.json`);
} else {
  const sibling = join(here, '..', '..', 'backend', 'openapi.json');
  if (!existsSync(sibling)) {
    console.error(
      `No API_SPEC_URL set and ${sibling} not found. Set API_SPEC_URL or check out backend as a sibling.`,
    );
    process.exit(1);
  }
  copyFileSync(sibling, out);
  console.log('Copied ../backend/openapi.json -> openapi.json');
}
