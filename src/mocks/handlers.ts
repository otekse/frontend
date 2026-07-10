import {
  getProductsControllerFindAllMockHandler,
  getProductsControllerFindOneMockHandler,
} from "@/api/generated/products/products.msw";
import { getHealthMock } from "@/api/generated/health/health.msw";
import type { ProductResponseDto } from "@/api/generated/model";

// MSW request handlers. On `client-preview` these intercept all API calls so
// the preview shows realistic fake data and never touches the real backend —
// PROJECT_BRIEF.md §10.
//
// Orval's auto-generated mocks fill every field with random `faker` strings,
// which yields an invalid `currency` (Intl.NumberFormat throws) and unreadable
// names. We keep using the generated *handlers* but feed them a curated,
// schema-valid catalogue that mirrors the shop design (Õtekse koduleht →
// E-pood). imageUrl is null on purpose so SmartImage renders the placeholder.
const previewProducts: ProductResponseDto[] = [
  {
    id: "tsark-otekse",
    name: 'T-särk „Õtekse"',
    description:
      "Orgaanilisest puuvillast särk ansambli logoga. Saadaval S–XL.",
    priceCents: 2500,
    currency: "EUR",
    sku: "OT-TS-01",
    size: "S–XL",
    color: null,
    stock: 12,
    imageUrl: null,
  },
  {
    id: "riidekott",
    name: "Riidekott",
    description:
      "Tugev riidekott laulusõnade mustriga — mahutab nii noodid kui piknikuvarud.",
    priceCents: 1500,
    currency: "EUR",
    sku: "OT-TB-01",
    size: null,
    color: null,
    stock: 20,
    imageUrl: null,
  },
  {
    id: "ratik",
    name: "Rätik",
    description:
      "Rahvariide-aineline rätik, nagu laval näha. Igal tükil oma muster.",
    priceCents: 1800,
    currency: "EUR",
    sku: "OT-HS-01",
    size: null,
    color: null,
    stock: 6,
    imageUrl: null,
  },
  {
    id: "album-hunt-aja-taga",
    name: 'Album „Hunt Aja Taga" (CD)',
    description: "Debüütalbum füüsilisel kujul, kaasas laulusõnade vihik.",
    priceCents: 2000,
    currency: "EUR",
    sku: "OT-CD-01",
    size: null,
    color: null,
    stock: 0,
    imageUrl: null,
  },
];

export const handlers = [
  getProductsControllerFindAllMockHandler(previewProducts),
  getProductsControllerFindOneMockHandler(
    ({ params }) =>
      previewProducts.find((p) => p.id === params.id) ?? previewProducts[0],
  ),
  ...getHealthMock(),
];
