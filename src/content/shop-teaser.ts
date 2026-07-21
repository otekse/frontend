// Homepage shop-teaser cards — static marketing content from the design
// (live prices/stock come from the API on the shop page itself).
export type TeaserItem = {
  name: { et: string; en: string };
  price: string;
  tilt: number; // degrees, per the design's hand-placed rotation
};

export const teaserItems: TeaserItem[] = [
  { name: { et: "T-särk", en: "T-shirt" }, price: "25 €", tilt: -1.5 },
  { name: { et: "Rätik", en: "Headscarf" }, price: "18 €", tilt: 1 },
  { name: { et: "Album (CD)", en: "Album (CD)" }, price: "20 €", tilt: -0.8 },
];
