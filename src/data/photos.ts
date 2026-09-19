import chinookLake from '../assets/photos/chinook-lake.webp';
import chinookGloves from '../assets/photos/chinook-gloves.webp';
import winterSteelhead from '../assets/photos/winter-steelhead.webp';
import steelheadDrift from '../assets/photos/steelhead-drift.webp';
import steelheadRiverbank from '../assets/photos/steelhead-riverbank.webp';
import salmonTeal from '../assets/photos/salmon-teal.webp';
import steelheadBlue from '../assets/photos/steelhead-blue.webp';
import salmonOnBoat from '../assets/photos/salmon-on-boat.webp';
import salmonSeated from '../assets/photos/salmon-seated.webp';
import guestsB from '../assets/photos/guests-b.webp';
import dungenessCrab from '../assets/photos/dungeness-crab.webp';
import oregonCoast from '../assets/photos/oregon-coast.webp';
import guestsA from '../assets/photos/guests-a.webp';
import fishfinder from '../assets/photos/fishfinder.webp';
import channelBuoy from '../assets/photos/channel-buoy.webp';
import logo from '../assets/photos/logo.webp';

export const PHOTOS = {
  guestsA,
  fishfinder,
  channelBuoy,
  chinookLake,
  chinookGloves,
  winterSteelhead,
  steelheadDrift,
  steelheadRiverbank,
  salmonTeal,
  steelheadBlue,
  salmonOnBoat,
  salmonSeated,
  guestsB,
  dungenessCrab,
  oregonCoast,
  logo,
};

export type PhotoKey = keyof typeof PHOTOS;

// Alt text and captions describe only what is visible in each photo. Species, river and boat are NOT stated because
// they have not been confirmed by the owner (see HANDOVER.md, photo identification).
export const GALLERY: { key: PhotoKey; alt: string; caption: string }[] = [
  { key: 'chinookLake', alt: 'Angler on a boat holding a large fish', caption: 'Big fish on the boat' },
  { key: 'winterSteelhead', alt: 'Angler on a boat holding a fish, bare trees behind', caption: 'Fish on a winter day' },
  { key: 'dungenessCrab', alt: 'Bin heaped with Dungeness crab', caption: 'Crab haul' },
  { key: 'steelheadRiverbank', alt: 'Angler kneeling on a rocky riverbank with a fish', caption: 'Riverbank catch' },
  { key: 'salmonSeated', alt: 'Angler seated on a boat holding a fish', caption: 'Seated with a catch' },
  { key: 'steelheadBlue', alt: 'Angler in a blue jacket giving a thumbs-up while holding a fish', caption: 'Thumbs up' },
  { key: 'salmonTeal', alt: 'Angler in a teal shirt holding a large fish on the water', caption: 'Out on the water' },
  { key: 'chinookGloves', alt: 'Angler with a blue glove holding a bright fish', caption: 'Bright fish' },
  { key: 'steelheadDrift', alt: 'Angler holding a fish in a boat on a river', caption: 'River catch' },
  { key: 'salmonOnBoat', alt: 'Angler standing on a boat holding a fish', caption: 'On the boat' },
  { key: 'guestsA', alt: 'Two anglers in life jackets posing with a fish', caption: 'Two anglers, one fish' },
  { key: 'guestsB', alt: 'Two anglers posing with a fish after a trip', caption: 'After the trip' },
  { key: 'oregonCoast', alt: 'Rugged Oregon coastline framed by a windswept tree', caption: 'The Oregon coast' },
  { key: 'channelBuoy', alt: 'Red channel marker buoy on the water', caption: 'Channel marker' },
  { key: 'fishfinder', alt: 'Fish finder sonar screen on a boat', caption: 'Sonar on board' },
];

// Largest CSS px width each image can be shown at (1x-2x) without visible softness. Source-limited, not file-limited.
export const PHOTO_META: Record<string, { w: number; h: number; maxDisplay: number; focal: string; note: string }> = {
  guestsA: { w: 2137, h: 2400, maxDisplay: 1790, focal: '50% 58%', note: "Two anglers in life vests with keeper fish, overcast" },
  fishfinder: { w: 1800, h: 2400, maxDisplay: 1800, focal: '50% 50%', note: "Garmin fish finder sonar screen aboard boat" },
  channelBuoy: { w: 1800, h: 2400, maxDisplay: 1800, focal: '50% 45%', note: "Red channel marker buoy on Columbia, overcast" },
  chinookLake: { w: 2400, h: 2400, maxDisplay: 1230, focal: '50% 42%', note: "Angler with large Chinook, blue water, sunny" },
  chinookGloves: { w: 2132, h: 2132, maxDisplay: 800, focal: '50% 42%', note: "Angler in cap with bright Chinook and blue glove, riverbank" },
  winterSteelhead: { w: 2397, h: 2400, maxDisplay: 1430, focal: '55% 45%', note: "Angler holding winter steelhead on boat, bare trees behind" },
  steelheadDrift: { w: 2400, h: 2400, maxDisplay: 1240, focal: '50% 45%', note: "Angler with steelhead in drift boat, river" },
  steelheadRiverbank: { w: 1807, h: 2400, maxDisplay: 1460, focal: '50% 50%', note: "Angler kneeling on cobble bank with steelhead" },
  salmonTeal: { w: 2344, h: 2344, maxDisplay: 870, focal: '50% 50%', note: "Angler in teal hoodie with big salmon, open water" },
  steelheadBlue: { w: 2204, h: 2204, maxDisplay: 820, focal: '50% 50%', note: "Smiling angler thumbs up with steelhead, blue hoodie" },
  salmonOnBoat: { w: 1788, h: 1788, maxDisplay: 670, focal: '42% 32%', note: "Angler standing on boat with silver salmon, small source" },
  salmonSeated: { w: 1476, h: 1476, maxDisplay: 550, focal: '50% 50%', note: "Guest seated on boat with salmon, weakest source" },
  guestsB: { w: 1799, h: 2400, maxDisplay: 1790, focal: '50% 58%', note: "Two guests with catch, lake, overcast" },
  dungenessCrab: { w: 2400, h: 2400, maxDisplay: 900, focal: '50% 50%', note: "Bucket of Dungeness crab, night flash" },
  oregonCoast: { w: 2400, h: 1599, maxDisplay: 1820, focal: '62% 50%', note: "Coastal sea stack framed by windswept tree at sunset" },
  logo: { w: 1200, h: 1200, maxDisplay: 490, focal: '50% 50%', note: "BDC crest logo on cream; raster from a 330px source" },
};

// Best-first hero picks (sharpest, most pleasing, subject-forward).
