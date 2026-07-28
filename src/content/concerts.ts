// Upcoming concerts — editable content (source: the design's Koduleht.md).
// This lives under src/content/ so the runtime orchestrator's path allowlist
// can expose it for client edits (PROJECT_BRIEF.md §10).

export type ConcertBadge = "free" | "ticketed" | "soon";

export type Concert = {
  date: string;
  title: { et: string; en: string };
  info: { et: string; en: string };
  url?: string;
  badge: ConcertBadge;
};

export const concerts: Concert[] = [
  {
    date: "23.06",
    badge: "free",
    title: {
      et: "Tabivere jaanituli",
      en: "Tabivere Midsummer bonfire",
    },
    info: {
      et: "Üritus algab kell 19.00, meie astume lavale kell 20.00.",
      en: "The event starts at 7 p.m.; we take the stage at 8 p.m.",
    },
  },
  {
    date: "11.07",
    badge: "ticketed",
    url: "https://vorufolkloor.ee/",
    title: {
      et: "Koduhoovi kontsert — Võru pärimustantsu festival",
      en: "Backyard concert — Võru Folk Dance Festival",
    },
    info: {
      et: "Kell 18.00, Jaama 37, Võru.",
      en: "At 6 p.m., Jaama 37, Võru.",
    },
  },
  {
    date: "17.07",
    badge: "free",
    url: "https://www.roositud.com/t%C3%B5stamaa%C3%B5hetus2026",
    title: {
      et: "Pärandkultuuri festival „Tõstamaa Õhetus“",
      en: "Heritage culture festival “Tõstamaa Õhetus”",
    },
    info: {
      et: "Kell 20.00, Tõstamaa rahvamaja ees.",
      en: "At 8 p.m., in front of the Tõstamaa community house.",
    },
  },
  {
    date: "22.07",
    badge: "free",
    title: {
      et: "Pargikontsert Pärnu Lastepargis",
      en: "Park concert at Pärnu Children’s Park",
    },
    info: {
      et: "Kell 18.00.",
      en: "At 6 p.m.",
    },
  },
  {
    date: "23–24.07",
    badge: "free",
    url: "https://www.viljandifolk.ee/",
    title: {
      et: "Viljandi pärimusmuusika festival",
      en: "Viljandi Folk Music Festival",
    },
    info: {
      et: "Roheline lava: 23.07 kell 22.00 ja 24.07 kell 15.00.",
      en: "Green Stage: 23 July at 10 p.m. and 24 July at 3 p.m.",
    },
  },
  {
    date: "23.08",
    badge: "soon",
    title: {
      et: "„Baltic Days“ — Riia, Läti",
      en: "“Baltic Days” — Riga, Latvia",
    },
    info: {
      et: "Lisainfo peagi!",
      en: "More info coming soon!",
    },
  },
];
