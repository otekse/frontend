import { getProductsMock } from "@/api/generated/products/products.msw";
import { getHealthMock } from "@/api/generated/health/health.msw";

// MSW request handlers, assembled from Orval-generated mocks. On
// `client-preview` these intercept all API calls so the preview shows
// realistic fake data and never touches the real backend — PROJECT_BRIEF.md §10.
export const handlers = [...getProductsMock(), ...getHealthMock()];
