import steelheadRiverbank from '../assets/photos/steelhead-riverbank.webp';
import rainbowTrout from '../assets/photos/rainbow-trout.webp';
import salmonOnBoat from '../assets/photos/salmon-on-boat.webp';
import twoAnglersChinook from '../assets/photos/two-anglers-chinook.webp';
import alumaweldBoat from '../assets/photos/alumaweld-boat.webp';
import yamahaBoat from '../assets/photos/yamaha-boat.webp';
import cohoBoatCatch from '../assets/photos/coho-boat-catch.webp';
import chinookLake from '../assets/photos/chinook-lake.webp';
import winterSteelhead from '../assets/photos/winter-steelhead.webp';
import chinookGloves from '../assets/photos/chinook-gloves.webp';
import netAnglers from '../assets/photos/net-anglers.webp';
import troutBoatSeated from '../assets/photos/trout-boat-seated.webp';
import steelheadBlue from '../assets/photos/steelhead-blue.webp';
import salmonSeated from '../assets/photos/salmon-seated.webp';
import dungenessCrab from '../assets/photos/dungeness-crab.webp';
import salmonTeal from '../assets/photos/salmon-teal.webp';
import guestsA from '../assets/photos/guests-a.webp';
import guestsB from '../assets/photos/guests-b.webp';
import fishfinder from '../assets/photos/fishfinder.webp';
import channelBuoy from '../assets/photos/channel-buoy.webp';
import oregonCoast from '../assets/photos/oregon-coast.webp';
import logo from '../assets/photos/logo.webp';
import { PHOTO_PAGES } from './photo-pages';

export const PHOTOS = {
  steelheadRiverbank,
  rainbowTrout,
  salmonOnBoat,
  twoAnglersChinook,
  alumaweldBoat,
  yamahaBoat,
  cohoBoatCatch,
  chinookLake,
  winterSteelhead,
  chinookGloves,
  netAnglers,
  troutBoatSeated,
  steelheadBlue,
  salmonSeated,
  dungenessCrab,
  salmonTeal,
  guestsA,
  guestsB,
  fishfinder,
  channelBuoy,
  oregonCoast,
  logo,
};

export type PhotoKey = keyof typeof PHOTOS;

export type GalleryCat = 'Catches' | 'Crab' | 'Boats' | 'On the water';

// The 16 photos from the previous site keep their own titles as captions and link to their photo page. `alt` describes
// only what is visible; species, river and boat are NOT stated because the owner has not confirmed them (HANDOVER.md).
const page = (key: PhotoKey) => {
  const p = PHOTO_PAGES.find((x) => x.key === key)!;
  return { key, alt: p.alt, caption: p.title, href: `/oregon-fishing-charter-photos/${p.slug}`, cat: p.cat as GalleryCat };
};

export const GALLERY: { key: PhotoKey; alt: string; caption: string; href?: string; cat: GalleryCat }[] = [
  page('chinookLake'),
  page('winterSteelhead'),
  page('dungenessCrab'),
  page('steelheadRiverbank'),
  page('salmonSeated'),
  page('steelheadBlue'),
  page('salmonTeal'),
  page('chinookGloves'),
  page('rainbowTrout'),
  page('salmonOnBoat'),
  page('cohoBoatCatch'),
  page('twoAnglersChinook'),
  page('netAnglers'),
  page('troutBoatSeated'),
  page('alumaweldBoat'),
  page('yamahaBoat'),
  { key: 'guestsA', alt: 'Two anglers in life jackets posing with a fish', caption: 'Two anglers, one fish', cat: 'Catches' },
  { key: 'guestsB', alt: 'Two anglers posing with a fish after a trip', caption: 'After the trip', cat: 'Catches' },
  { key: 'oregonCoast', alt: 'Rugged Oregon coastline framed by a windswept tree', caption: 'The Oregon coast', cat: 'On the water' },
  { key: 'channelBuoy', alt: 'Red channel marker buoy on the water', caption: 'Channel marker', cat: 'On the water' },
  { key: 'fishfinder', alt: 'Fish finder sonar screen on a boat', caption: 'Sonar on board', cat: 'On the water' },
];

// Largest CSS px width each image can be shown at (1x-2x) without visible softness. Source-limited, not file-limited:
// the 16 photo-page images come from 443-1189px originals on the old site, upscaled 4x (docs/HANDOVER.md).
export const PHOTO_META: Record<string, { w: number; h: number; maxDisplay: number; focal: string; note: string }> = {
  guestsA: { w: 2137, h: 2400, maxDisplay: 1790, focal: '50% 58%', note: "Two anglers in life vests with keeper fish, overcast" },
  guestsB: { w: 1799, h: 2400, maxDisplay: 1790, focal: '50% 58%', note: "Two guests with catch, lake, overcast" },
  fishfinder: { w: 1800, h: 2400, maxDisplay: 1800, focal: '50% 50%', note: "Garmin fish finder sonar screen aboard boat" },
  channelBuoy: { w: 1800, h: 2400, maxDisplay: 1800, focal: '50% 45%', note: "Red channel marker buoy on Columbia, overcast" },
  oregonCoast: { w: 2400, h: 1599, maxDisplay: 1820, focal: '62% 50%', note: "Coastal sea stack framed by windswept tree at sunset" },
  logo: { w: 1200, h: 1200, maxDisplay: 490, focal: '50% 50%', note: "BDC crest logo on cream; raster from a 330px source" },
  steelheadRiverbank: { w: 1792, h: 2380, maxDisplay: 672, focal: '50% 30%', note: 'Full-frame original from the previous site, 448px wide, upscaled 4x' },
  rainbowTrout: { w: 1781, h: 2400, maxDisplay: 830, focal: '50% 35%', note: 'Full-frame original from the previous site, 553px wide, upscaled 4x' },
  salmonOnBoat: { w: 1788, h: 2384, maxDisplay: 670, focal: '42% 32%', note: 'Full-frame original from the previous site, 447px wide, upscaled 4x' },
  twoAnglersChinook: { w: 1804, h: 2400, maxDisplay: 932, focal: '50% 35%', note: 'Full-frame original from the previous site, 621px wide, upscaled 4x' },
  alumaweldBoat: { w: 2400, h: 1766, maxDisplay: 1653, focal: '50% 55%', note: 'Full-frame original from the previous site, 1102px wide, upscaled 4x' },
  yamahaBoat: { w: 2400, h: 1430, maxDisplay: 1214, focal: '55% 55%', note: 'Full-frame original from the previous site, 809px wide, upscaled 4x' },
  cohoBoatCatch: { w: 2400, h: 1811, maxDisplay: 1424, focal: '50% 35%', note: 'Full-frame original from the previous site, 949px wide, upscaled 4x' },
  chinookLake: { w: 2400, h: 1790, maxDisplay: 1653, focal: '50% 42%', note: 'Full-frame original from the previous site, 1102px wide, upscaled 4x' },
  winterSteelhead: { w: 2400, h: 1802, maxDisplay: 1656, focal: '55% 45%', note: 'Full-frame original from the previous site, 1104px wide, upscaled 4x' },
  chinookGloves: { w: 1804, h: 2400, maxDisplay: 932, focal: '50% 38%', note: 'Full-frame original from the previous site, 621px wide, upscaled 4x' },
  netAnglers: { w: 2400, h: 1342, maxDisplay: 1784, focal: '50% 40%', note: 'Full-frame original from the previous site, 1189px wide, upscaled 4x' },
  troutBoatSeated: { w: 2400, h: 1801, maxDisplay: 1118, focal: '50% 40%', note: 'Full-frame original from the previous site, 745px wide, upscaled 4x' },
  steelheadBlue: { w: 1794, h: 2400, maxDisplay: 826, focal: '50% 40%', note: 'Full-frame original from the previous site, 551px wide, upscaled 4x' },
  salmonSeated: { w: 1772, h: 2380, maxDisplay: 664, focal: '50% 45%', note: 'Full-frame original from the previous site, 443px wide, upscaled 4x' },
  dungenessCrab: { w: 1784, h: 2400, maxDisplay: 900, focal: '50% 55%', note: 'Full-frame original from the previous site, 600px wide, upscaled 4x' },
  salmonTeal: { w: 1799, h: 2400, maxDisplay: 930, focal: '50% 45%', note: 'Full-frame original from the previous site, 620px wide, upscaled 4x' },
};
