// Brands Captain Clinton has worked with, per Amardeep (ETHIXWEB) on 11 June 2026.
// Logos live in public/media/partners and come from each company's own website (6 November 2026):
// - Okuma and Yakima Bait: the brands' own SVGs (Okuma's cropped from an "Okuma x FishLab" lockup).
// - Maxima: their logo is white-on-dark PNG only, so it was traced to SVG and set in dark ink, with
//   the green "Fishing Line" kept.
// - Fisherman's Marine: their site only has a 350px logo, so the round badge was cut out of the
//   1600px banner image on their homepage, which is about three times sharper.
// Width and height are the file's own proportions so the browser can reserve space.
export interface Partner {
  name: string;
  logo: string;
  width: number;
  height: number;
  url: string;
  /** A tall, badge-shaped logo that should use the full height of its card. */
  badge?: boolean;
}

export const PARTNERS: Partner[] = [
  { name: 'Maxima Fishing Line', logo: '/media/partners/maxima-fishing-line.svg', width: 611, height: 166, url: 'https://www.maximafishingline.com/' },
  { name: 'Okuma', logo: '/media/partners/okuma.svg', width: 450, height: 102, url: 'https://okumafishingusa.com/' },
  { name: "Fisherman's Marine & Outdoor", logo: '/media/partners/fishermans-marine.webp', width: 974, height: 839, url: 'https://fishermans-marine.com/', badge: true },
  { name: 'Yakima Bait', logo: '/media/partners/yakima-bait.svg', width: 219, height: 76, url: 'https://www.yakimabait.com/' },
];
