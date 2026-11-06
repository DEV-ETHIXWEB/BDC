// Brands Captain Clinton has worked with, per Amardeep (ETHIXWEB) on 11 June 2026.
// Logos were taken from each company's own website on 6 November 2026 and live in
// public/media/partners. Width and height are the file's own size so the browser can reserve space.
export interface Partner {
  name: string;
  logo: string;
  width: number;
  height: number;
  url: string;
}

export const PARTNERS: Partner[] = [
  { name: 'Maxima Fishing Line', logo: '/media/partners/maxima-fishing-line.png', width: 615, height: 170, url: 'https://www.maximafishingline.com/' },
  { name: 'Okuma', logo: '/media/partners/okuma.svg', width: 450, height: 102, url: 'https://okumafishingusa.com/' },
  { name: "Fisherman's Marine & Outdoor", logo: '/media/partners/fishermans-marine.png', width: 350, height: 94, url: 'https://fishermans-marine.com/' },
  { name: 'Yakima Bait', logo: '/media/partners/yakima-bait.svg', width: 219, height: 76, url: 'https://www.yakimabait.com/' },
];
