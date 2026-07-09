import { defineConfig } from 'orval';

// Generates the typed client + React Query hooks + MSW mock handlers from the
// committed openapi.json snapshot. See AGENTS.md "API client (Orval)".
// Regenerate with `npm run api:generate` after `npm run spec:pull`.
export default defineConfig({
  otekse: {
    input: './openapi.json',
    output: {
      mode: 'tags-split',
      target: './src/api/generated',
      schemas: './src/api/generated/model',
      client: 'react-query',
      httpClient: 'axios',
      mock: true,
      clean: true,
      prettier: true,
      override: {
        mutator: {
          path: './src/api/axios-instance.ts',
          name: 'customInstance',
        },
      },
    },
  },
});
