import type { PhotoKey } from './photos';

export interface Trip {
  slug: string;
  name: string;
  short: string;
  hours: number;
  price: number; // USD per person
  boat: 'Willy Predator' | 'Alumaweld Guide Model';
  boatSpec: string;
  capacity: number;
  kind: 'river' | 'drift' | 'crab';
  species: string[];
  season?: string;
  seoTitle: string;
  tagline: string;
  description: string;
  photo: PhotoKey;
  includes: string[];
}

const fishIncludes = ['Professional guide', 'Boat', 'All fishing gear and bait'];
const crabIncludes = ['Professional guide', 'Boat', 'All necessary equipment'];

export const TRIPS: Trip[] = [
  {
    slug: 'full-day-drift-boat',
    name: 'Full Day Drift Boat',
    short: 'Steelhead & river adventures',
    hours: 8,
    price: 250,
    boat: 'Alumaweld Guide Model',
    boatSpec: "16' Alumaweld drift boat",
    capacity: 3,
    kind: 'drift',
    species: ['Winter steelhead'],
    seoTitle: 'Full Day Drift Boat Steelhead Trip, Oregon',
    tagline: '8 hours of guided drift-boat steelhead fishing',
    description:
      'Eight guided hours in a 16-foot Alumaweld drift boat on the rivers that hold winter steelhead. The low-profile boat reaches shallow water bigger boats cannot, and Captain Clinton reads the river and conditions to put you on fish.',
    photo: 'steelheadDrift',
    includes: fishIncludes,
  },
  {
    slug: 'full-day-willy-predator',
    name: 'Full Day Trip',
    short: 'Salmon, steelhead & more',
    hours: 8,
    price: 250,
    boat: 'Willy Predator',
    boatSpec: "22' Willy Predator",
    capacity: 6,
    kind: 'river',
    species: ['Chinook salmon', 'Steelhead', 'Seasonal species'],
    seoTitle: 'Full Day Salmon & Steelhead Trip, Oregon',
    tagline: '8-hour guided trip for salmon, steelhead & more',
    description:
      'A full day aboard the 22-foot Willy Predator, built for salmon fishing on larger rivers like the Columbia and Willamette. Twin Yamaha power (150 HP main, 9.9 HP kicker) gets you to the fish and keeps trolling steady.',
    photo: 'winterSteelhead',
    includes: fishIncludes,
  },
  {
    slug: 'half-day-willy-predator',
    name: 'Half Day Trip',
    short: 'Quick & productive action',
    hours: 4,
    price: 150,
    boat: 'Willy Predator',
    boatSpec: "22' Willy Predator",
    capacity: 6,
    kind: 'river',
    species: ['Chinook salmon', 'Steelhead', 'Seasonal species'],
    seoTitle: 'Half Day Oregon Fishing Charter',
    tagline: '4-hour guided trip for quick, productive action',
    description:
      'Four focused hours on the Willy Predator: ideal for families, first-timers and anglers who want real fishing without a full-day commitment.',
    photo: 'salmonOnBoat',
    includes: fishIncludes,
  },
  {
    slug: 'half-day-drift-boat',
    name: 'Half Day Drift Boat',
    short: 'Steelhead & scenic trips',
    hours: 4,
    price: 150,
    boat: 'Alumaweld Guide Model',
    boatSpec: "16' Alumaweld drift boat",
    capacity: 3,
    kind: 'drift',
    species: ['Steelhead', 'Seasonal species'],
    seoTitle: 'Half Day Drift Boat Fishing, Oregon',
    tagline: '4-hour drift-boat steelhead and scenic river trip',
    description:
      'A relaxed four-hour float in the Alumaweld drift boat. Quiet water, Oregon scenery, and steelhead on the line when conditions line up.',
    photo: 'steelheadRiverbank',
    includes: fishIncludes,
  },
  {
    slug: 'crabbing-charter-willy-predator',
    name: 'Crabbing Charter (Willy Predator)',
    short: 'Dungeness crab & family fun',
    hours: 5,
    price: 150,
    boat: 'Willy Predator',
    boatSpec: "22' Willy Predator",
    capacity: 6,
    kind: 'crab',
    species: ['Dungeness crab'],
    season: 'October through December',
    seoTitle: 'Oregon Crabbing Charter, Willy Predator',
    tagline: '5-hour fall crabbing trip for fresh Dungeness crab',
    description:
      'Fall crabbing aboard the Willy Predator: pull pots, sort keepers and take home fresh Dungeness crab. A family favorite from October through December.',
    photo: 'dungenessCrab',
    includes: crabIncludes,
  },
  {
    slug: 'crabbing-charter-alumaweld',
    name: 'Crabbing Charter (Alumaweld)',
    short: 'River & coastal experiences',
    hours: 5,
    price: 150,
    boat: 'Alumaweld Guide Model',
    boatSpec: "16' Alumaweld drift boat",
    capacity: 3,
    kind: 'crab',
    species: ['Dungeness crab'],
    season: 'October through December',
    seoTitle: 'Oregon Crabbing Trip by Drift Boat',
    tagline: '5-hour crabbing trip with a river-and-coast twist',
    description:
      'A smaller, more personal crabbing trip aboard the 16-foot Alumaweld: a different way to experience Oregon crabbing from October through December.',
    photo: 'dungenessCrab',
    includes: crabIncludes,
  },
];

export const tripBySlug = (slug: string) => TRIPS.find((t) => t.slug === slug)!;
export const priceLabel = (n: number) => `$${n}`;
