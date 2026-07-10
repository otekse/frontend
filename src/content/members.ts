// Band members — editable content (source: the design's Koduleht.md).
// Palette values are design-token names resolved in the MembersSection styles,
// mirroring the per-member color fills in the design.
import { IMAGES } from "./assets";

export type MemberPalette = "gold" | "rust" | "pine";

export type Member = {
  name: string;
  loc: string;
  palette: MemberPalette;
  photo: string;
  job: { et: string; en: string };
  hobby: { et: string; en: string };
  quote: { et: string; en: string };
};

export const members: Member[] = [
  {
    name: "Mirtel Katrina",
    loc: "Pärnu",
    palette: "gold",
    photo: IMAGES.members.mirtel,
    job: {
      et: "Täiskohaga gümnasist",
      en: "Full-time high school student",
    },
    hobby: {
      et: "Liiga palju hobisid :D (laulmine, rahvatants, koorilaul, ratsutamine, muusikakool…)",
      en: "Too many to count :D (singing, folk dance, choir, horse riding, music school…)",
    },
    quote: {
      et: "Minu esimene esinemine õdedega toimus Mooste rahvamuusikatöötlusfestivalil. Olin siis vaid 11-aastane ja sain esimest korda suuremal konkursil Õteksega lavale astuda. Mäletan siiani seda suurt õnne ja elevust, et sain koos õdedega esineda.",
      en: "My first performance with my sisters took place at the Mooste Folk Music Arrangement Festival. I was only 11 at the time, and I got to perform with Õtekse on a bigger stage for the very first time. I still remember the overwhelming happiness and excitement of performing together with my sisters.",
    },
  },
  {
    name: "Mirjam",
    loc: "Tallinn",
    palette: "rust",
    photo: IMAGES.members.mirjam,
    job: {
      et: "Klassiruumist lavalaudadele",
      en: "Between the classroom and the stage",
    },
    hobby: {
      et: "Laulukirjutamine",
      en: "Songwriting",
    },
    quote: {
      et: "Meie kõige esimene muusikavideo „Lustila elada“ filmimine. Otsustasime spontaanselt minna loole videot filmima ning kiire elutempo tõttu alustasime filmimist rannas juba kell 5 hommikul :) ja sealt see kõik algaski!",
      en: "Filming our very first music video “Lustila elada”. We spontaneously decided to film a video for the song, and due to our busy schedules we started filming at the beach at 5 a.m. :) and that’s where it all began!",
    },
  },
  {
    name: "Kätlin",
    loc: "Tartu",
    palette: "pine",
    photo: IMAGES.members.katlin,
    job: {
      et: "Sertifikaadiga arst",
      en: "Certified doctor",
    },
    hobby: {
      et: "Kalapüük",
      en: "Fishing",
    },
    quote: {
      et: "Meie esimene esinemine rahvusvahelisel festivalil Lätis. Väike saal tuli äärest ääreni inimesi täis. 45-minutilisest kontserdist sai veidi üle tunni — aeg jäi justkui seisma ning olime kõik üks!",
      en: "Our first performance at an international festival in Latvia. The small hall was packed wall to wall. What was supposed to be a 45-minute concert turned into over an hour — time stood still, and we were all as one!",
    },
  },
];
