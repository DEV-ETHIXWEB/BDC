import chinookLake from '../assets/photos/chinook-lake.webp';
import chinookLakePortrait from '../assets/photos/chinook-lake-portrait.webp';
import chinookLakeWide from '../assets/photos/chinook-lake-wide.webp';
import chinookGloves from '../assets/photos/chinook-gloves.webp';
import chinookGlovesPortrait from '../assets/photos/chinook-gloves-portrait.webp';
import chinookGlovesWide from '../assets/photos/chinook-gloves-wide.webp';
import winterSteelhead from '../assets/photos/winter-steelhead.webp';
import winterSteelheadPortrait from '../assets/photos/winter-steelhead-portrait.webp';
import winterSteelheadWide from '../assets/photos/winter-steelhead-wide.webp';
import steelheadDrift from '../assets/photos/steelhead-drift.webp';
import steelheadDriftPortrait from '../assets/photos/steelhead-drift-portrait.webp';
import steelheadDriftWide from '../assets/photos/steelhead-drift-wide.webp';
import steelheadRiverbank from '../assets/photos/steelhead-riverbank.webp';
import steelheadRiverbankPortrait from '../assets/photos/steelhead-riverbank-portrait.webp';
import steelheadRiverbankWide from '../assets/photos/steelhead-riverbank-wide.webp';
import salmonTeal from '../assets/photos/salmon-teal.webp';
import salmonTealPortrait from '../assets/photos/salmon-teal-portrait.webp';
import salmonTealWide from '../assets/photos/salmon-teal-wide.webp';
import steelheadBlue from '../assets/photos/steelhead-blue.webp';
import steelheadBluePortrait from '../assets/photos/steelhead-blue-portrait.webp';
import steelheadBlueWide from '../assets/photos/steelhead-blue-wide.webp';
import salmonOnBoat from '../assets/photos/salmon-on-boat.webp';
import salmonOnBoatPortrait from '../assets/photos/salmon-on-boat-portrait.webp';
import salmonOnBoatWide from '../assets/photos/salmon-on-boat-wide.webp';
import salmonSeated from '../assets/photos/salmon-seated.webp';
import salmonSeatedPortrait from '../assets/photos/salmon-seated-portrait.webp';
import salmonSeatedWide from '../assets/photos/salmon-seated-wide.webp';
import guestsA from '../assets/photos/guests-a.webp';
import guestsAPortrait from '../assets/photos/guests-a-portrait.webp';
import guestsAWide from '../assets/photos/guests-a-wide.webp';
import guestsB from '../assets/photos/guests-b.webp';
import guestsBPortrait from '../assets/photos/guests-b-portrait.webp';
import guestsBWide from '../assets/photos/guests-b-wide.webp';
import dungenessCrab from '../assets/photos/dungeness-crab.webp';
import dungenessCrabPortrait from '../assets/photos/dungeness-crab-portrait.webp';
import dungenessCrabWide from '../assets/photos/dungeness-crab-wide.webp';
import oregonCoast from '../assets/photos/oregon-coast.webp';
import oregonCoastPortrait from '../assets/photos/oregon-coast-portrait.webp';
import oregonCoastWide from '../assets/photos/oregon-coast-wide.webp';
import shrimpBoatSunset from '../assets/photos/shrimp-boat-sunset.webp';
import shrimpBoatSunsetWide from '../assets/photos/shrimp-boat-sunset-wide.webp';
import fishfinder from '../assets/photos/fishfinder.webp';
import fishfinderPortrait from '../assets/photos/fishfinder-portrait.webp';
import fishfinderWide from '../assets/photos/fishfinder-wide.webp';
import channelBuoy from '../assets/photos/channel-buoy.webp';
import channelBuoyPortrait from '../assets/photos/channel-buoy-portrait.webp';
import channelBuoyWide from '../assets/photos/channel-buoy-wide.webp';
import logo from '../assets/photos/logo.webp';

export const PHOTOS = {
  chinookLake,
  chinookLakePortrait,
  chinookLakeWide,
  chinookGloves,
  chinookGlovesPortrait,
  chinookGlovesWide,
  winterSteelhead,
  winterSteelheadPortrait,
  winterSteelheadWide,
  steelheadDrift,
  steelheadDriftPortrait,
  steelheadDriftWide,
  steelheadRiverbank,
  steelheadRiverbankPortrait,
  steelheadRiverbankWide,
  salmonTeal,
  salmonTealPortrait,
  salmonTealWide,
  steelheadBlue,
  steelheadBluePortrait,
  steelheadBlueWide,
  salmonOnBoat,
  salmonOnBoatPortrait,
  salmonOnBoatWide,
  salmonSeated,
  salmonSeatedPortrait,
  salmonSeatedWide,
  guestsA,
  guestsAPortrait,
  guestsAWide,
  guestsB,
  guestsBPortrait,
  guestsBWide,
  dungenessCrab,
  dungenessCrabPortrait,
  dungenessCrabWide,
  oregonCoast,
  oregonCoastPortrait,
  oregonCoastWide,
  shrimpBoatSunset,
  shrimpBoatSunsetWide,
  fishfinder,
  fishfinderPortrait,
  fishfinderWide,
  channelBuoy,
  channelBuoyPortrait,
  channelBuoyWide,
  logo,
};

export type PhotoKey = keyof typeof PHOTOS;

// Descriptive alt text: good for accessibility and image SEO.
export const GALLERY: { key: PhotoKey; alt: string; caption: string }[] = [
  { key: 'chinookLake', alt: 'Angler holding a large silver Chinook salmon on a BDC Guide Service boat', caption: 'Chinook salmon' },
  { key: 'winterSteelhead', alt: 'Angler holding a fresh winter steelhead on the Willy Predator', caption: 'Winter steelhead' },
  { key: 'dungenessCrab', alt: 'Bucket full of fresh Dungeness crab after an Oregon crabbing charter', caption: 'Dungeness crab haul' },
  { key: 'steelheadRiverbank', alt: 'Angler kneeling on a rocky Oregon riverbank with a steelhead', caption: 'Riverbank steelhead' },
  { key: 'salmonSeated', alt: 'Guest seated on the boat with a salmon on the Columbia River', caption: 'Columbia River salmon' },
  { key: 'steelheadBlue', alt: 'Angler giving a thumbs-up while holding a steelhead', caption: 'Thumbs-up steelhead' },
  { key: 'salmonTeal', alt: 'Angler in a teal shirt holding a large salmon on the water', caption: 'Big-water salmon' },
  { key: 'chinookGloves', alt: 'Angler with gloves holding a bright Chinook salmon', caption: 'Bright Chinook' },
  { key: 'steelheadDrift', alt: 'Angler holding a steelhead in the drift boat', caption: 'Drift-boat steelhead' },
  { key: 'salmonOnBoat', alt: 'Guest standing on the boat with a silver salmon', caption: 'Silver salmon' },
  { key: 'guestsA', alt: 'Two anglers posing with a keeper fish on a BDC Guide Service trip', caption: 'Happy guests' },
  { key: 'guestsB', alt: 'Two guests with their catch after a guided Oregon fishing trip', caption: 'Guests with their catch' },
  { key: 'oregonCoast', alt: 'Rugged Oregon coastline framed by a windswept tree at sunset', caption: 'The Oregon coast' },
  { key: 'shrimpBoatSunset', alt: 'Fishing boat silhouetted against an orange Oregon sunset', caption: 'Sunset on the water' },
  { key: 'channelBuoy', alt: 'Red channel marker buoy on the Columbia River', caption: 'Channel marker' },
  { key: 'fishfinder', alt: 'Fish finder sonar screen aboard the Willy Predator', caption: 'Sonar on board' },
];

// Largest CSS px width each image can be shown at (1x-2x) without visible softness. Source-limited, not file-limited.
export const PHOTO_META: Record<string, { w: number; h: number; maxDisplay: number; focal: string; note: string }> = {
  chinookLake: { w: 2400, h: 2400, maxDisplay: 1230, focal: '50% 42%', note: "Angler with large Chinook, blue water, sunny" },
  chinookLakePortrait: { w: 1600, h: 2000, maxDisplay: 980, focal: '50% 42%', note: "Angler with large Chinook, blue water, sunny (portrait crop)" },
  chinookLakeWide: { w: 2000, h: 1125, maxDisplay: 1230, focal: '50% 42%', note: "Angler with large Chinook, blue water, sunny (wide crop)" },
  chinookGloves: { w: 2132, h: 2132, maxDisplay: 800, focal: '50% 42%', note: "Angler in cap with bright Chinook and blue glove, riverbank" },
  chinookGlovesPortrait: { w: 1600, h: 2000, maxDisplay: 640, focal: '50% 42%', note: "Angler in cap with bright Chinook and blue glove, riverbank (portrait crop)" },
  chinookGlovesWide: { w: 2000, h: 1125, maxDisplay: 800, focal: '50% 42%', note: "Angler in cap with bright Chinook and blue glove, riverbank (wide crop)" },
  winterSteelhead: { w: 2397, h: 2400, maxDisplay: 1430, focal: '55% 45%', note: "Angler holding winter steelhead on boat, bare trees behind" },
  winterSteelheadPortrait: { w: 1600, h: 2000, maxDisplay: 1150, focal: '55% 45%', note: "Angler holding winter steelhead on boat, bare trees behind (portrait crop)" },
  winterSteelheadWide: { w: 2000, h: 1125, maxDisplay: 1430, focal: '55% 45%', note: "Angler holding winter steelhead on boat, bare trees behind (wide crop)" },
  steelheadDrift: { w: 2400, h: 2400, maxDisplay: 1240, focal: '50% 45%', note: "Angler with steelhead in drift boat, river" },
  steelheadDriftPortrait: { w: 1600, h: 2000, maxDisplay: 990, focal: '50% 45%', note: "Angler with steelhead in drift boat, river (portrait crop)" },
  steelheadDriftWide: { w: 2000, h: 1125, maxDisplay: 1240, focal: '50% 45%', note: "Angler with steelhead in drift boat, river (wide crop)" },
  steelheadRiverbank: { w: 1807, h: 2400, maxDisplay: 1460, focal: '50% 50%', note: "Angler kneeling on cobble bank with steelhead" },
  steelheadRiverbankPortrait: { w: 1600, h: 2000, maxDisplay: 1460, focal: '50% 50%', note: "Angler kneeling on cobble bank with steelhead (portrait crop)" },
  steelheadRiverbankWide: { w: 1807, h: 1016, maxDisplay: 1460, focal: '50% 50%', note: "Angler kneeling on cobble bank with steelhead (wide crop)" },
  salmonTeal: { w: 2344, h: 2344, maxDisplay: 870, focal: '50% 50%', note: "Angler in teal hoodie with big salmon, open water" },
  salmonTealPortrait: { w: 1600, h: 2000, maxDisplay: 700, focal: '50% 50%', note: "Angler in teal hoodie with big salmon, open water (portrait crop)" },
  salmonTealWide: { w: 2000, h: 1125, maxDisplay: 870, focal: '50% 50%', note: "Angler in teal hoodie with big salmon, open water (wide crop)" },
  steelheadBlue: { w: 2204, h: 2204, maxDisplay: 820, focal: '50% 50%', note: "Smiling angler thumbs up with steelhead, blue hoodie" },
  steelheadBluePortrait: { w: 1600, h: 2000, maxDisplay: 660, focal: '50% 50%', note: "Smiling angler thumbs up with steelhead, blue hoodie (portrait crop)" },
  steelheadBlueWide: { w: 2000, h: 1125, maxDisplay: 820, focal: '50% 50%', note: "Smiling angler thumbs up with steelhead, blue hoodie (wide crop)" },
  salmonOnBoat: { w: 1788, h: 1788, maxDisplay: 670, focal: '42% 32%', note: "Angler standing on boat with silver salmon, small source" },
  salmonOnBoatPortrait: { w: 1430, h: 1788, maxDisplay: 530, focal: '42% 32%', note: "Angler standing on boat with silver salmon, small source (portrait crop)" },
  salmonOnBoatWide: { w: 1788, h: 1005, maxDisplay: 670, focal: '42% 32%', note: "Angler standing on boat with silver salmon, small source (wide crop)" },
  salmonSeated: { w: 1476, h: 1476, maxDisplay: 550, focal: '50% 50%', note: "Guest seated on boat with salmon, weakest source" },
  salmonSeatedPortrait: { w: 1180, h: 1476, maxDisplay: 440, focal: '50% 50%', note: "Guest seated on boat with salmon, weakest source (portrait crop)" },
  salmonSeatedWide: { w: 1476, h: 830, maxDisplay: 550, focal: '50% 50%', note: "Guest seated on boat with salmon, weakest source (wide crop)" },
  guestsA: { w: 2137, h: 2400, maxDisplay: 1790, focal: '50% 58%', note: "Two anglers in life vests with keeper fish, overcast" },
  guestsAPortrait: { w: 1600, h: 2000, maxDisplay: 1600, focal: '50% 58%', note: "Two anglers in life vests with keeper fish, overcast (portrait crop)" },
  guestsAWide: { w: 2000, h: 1125, maxDisplay: 1790, focal: '50% 58%', note: "Two anglers in life vests with keeper fish, overcast (wide crop)" },
  guestsB: { w: 1799, h: 2400, maxDisplay: 1790, focal: '50% 58%', note: "Two guests with catch, lake, overcast" },
  guestsBPortrait: { w: 1600, h: 2000, maxDisplay: 1600, focal: '50% 58%', note: "Two guests with catch, lake, overcast (portrait crop)" },
  guestsBWide: { w: 1799, h: 1011, maxDisplay: 1790, focal: '50% 58%', note: "Two guests with catch, lake, overcast (wide crop)" },
  dungenessCrab: { w: 2400, h: 2400, maxDisplay: 900, focal: '50% 50%', note: "Bucket of Dungeness crab, night flash" },
  dungenessCrabPortrait: { w: 1600, h: 2000, maxDisplay: 720, focal: '50% 50%', note: "Bucket of Dungeness crab, night flash (portrait crop)" },
  dungenessCrabWide: { w: 2000, h: 1125, maxDisplay: 900, focal: '50% 50%', note: "Bucket of Dungeness crab, night flash (wide crop)" },
  oregonCoast: { w: 2400, h: 1599, maxDisplay: 1820, focal: '62% 50%', note: "Coastal sea stack framed by windswept tree at sunset" },
  oregonCoastPortrait: { w: 1279, h: 1599, maxDisplay: 970, focal: '62% 50%', note: "Coastal sea stack framed by windswept tree at sunset (portrait crop)" },
  oregonCoastWide: { w: 2000, h: 1125, maxDisplay: 1820, focal: '62% 50%', note: "Coastal sea stack framed by windswept tree at sunset (wide crop)" },
  shrimpBoatSunset: { w: 2400, h: 840, maxDisplay: 1680, focal: '72% 55%', note: "Boat silhouette against orange sky, panoramic" },
  shrimpBoatSunsetWide: { w: 1493, h: 840, maxDisplay: 1040, focal: '72% 55%', note: "Boat silhouette against orange sky, panoramic (wide crop)" },
  fishfinder: { w: 1800, h: 2400, maxDisplay: 1800, focal: '50% 50%', note: "Garmin fish finder sonar screen aboard boat" },
  fishfinderPortrait: { w: 1600, h: 2000, maxDisplay: 1600, focal: '50% 50%', note: "Garmin fish finder sonar screen aboard boat (portrait crop)" },
  fishfinderWide: { w: 1800, h: 1012, maxDisplay: 1800, focal: '50% 50%', note: "Garmin fish finder sonar screen aboard boat (wide crop)" },
  channelBuoy: { w: 1800, h: 2400, maxDisplay: 1800, focal: '50% 45%', note: "Red channel marker buoy on Columbia, overcast" },
  channelBuoyPortrait: { w: 1600, h: 2000, maxDisplay: 1600, focal: '50% 45%', note: "Red channel marker buoy on Columbia, overcast (portrait crop)" },
  channelBuoyWide: { w: 1800, h: 1012, maxDisplay: 1800, focal: '50% 45%', note: "Red channel marker buoy on Columbia, overcast (wide crop)" },
  logo: { w: 1200, h: 1200, maxDisplay: 490, focal: '50% 50%', note: "BDC crest logo on cream; raster from a 330px source" },
};

// Best-first hero picks (sharpest, most pleasing, subject-forward).
export const HERO_CANDIDATES: PhotoKey[] = [
  'oregonCoastWide', 'winterSteelheadWide', 'steelheadRiverbankWide', 'guestsAWide', 'guestsBWide',
  'chinookLakeWide', 'steelheadDriftWide', 'oregonCoast', 'shrimpBoatSunset',
];
