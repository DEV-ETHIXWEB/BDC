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
  /** Title and meta description are the ones already indexed on the old site (kept for search continuity). */
  seoTitle: string;
  metaDescription: string;
  tagline: string;
  description: string;
  photo: PhotoKey;
  includes: string[];
}

const fishIncludes = ['Professional guide', 'Boat', 'All fishing gear and bait'];
const crabIncludes = ['Professional guide', 'Boat', 'All necessary equipment'];

export const TRIPS: Trip[] = [
  {
    slug: 'oregon-fishing-charter-full-day-drift-trip',
    name: 'Full Day Drift Boat',
    short: 'Steelhead & river adventures',
    hours: 8,
    price: 250,
    boat: 'Alumaweld Guide Model',
    boatSpec: "16' Alumaweld drift boat",
    capacity: 3,
    kind: 'drift',
    species: ['Winter steelhead'],
    seoTitle: "Oregon Drift Boat Fishing Charter",
    metaDescription: "Join our 8-hour Oregon river fishing trip aboard an Alumaweld drift boat. Expert guides, steelhead fishing, $250 per person. Book today with BDC Guide Service.",
    tagline: '8 hours of guided drift-boat steelhead fishing',
    description:
      "Spend a full day on Oregon’s scenic rivers aboard our Alumaweld Guide Model, built for smooth and productive Oregon fishing charters in shallow water conditions. This 8-hour trip is perfect for targeting winter steelhead while enjoying an authentic drift boat experience with a knowledgeable Oregon fishing guide. Designed for smaller groups, this trip offers a more personal and focused approach, making it one of the most rewarding guided fishing trips in Oregon for anglers who want to explore premier river systems.",
    photo: 'steelheadDrift',
    includes: fishIncludes,
  },
  {
    slug: 'full-day-oregon-river-fishing-charter',
    name: 'Full Day Trip',
    short: 'Salmon, steelhead & more',
    hours: 8,
    price: 250,
    boat: 'Willy Predator',
    boatSpec: "22' Willy Predator",
    capacity: 6,
    kind: 'river',
    species: ['Chinook salmon', 'Steelhead', 'Seasonal species'],
    seoTitle: "Oregon Full Day River Fishing Charter",
    metaDescription: "Join BDC Guide Service for 8 hours targeting salmon and steelhead on Oregon's top rivers. Book today!",
    tagline: '8-hour guided trip for salmon, steelhead & more',
    description:
      "Enjoy a full day on the water with BDC Guide Service aboard our Willy Predator sled, built for productive and comfortable Oregon fishing charters. This 8-hour trip is ideal for anglers looking to maximize their time targeting salmon, steelhead, or seasonal species across Oregon’s top rivers. With expert guidance from a professional Oregon fishing guide, you’ll fish proven locations using techniques tailored to current conditions, making this one of the most rewarding guided fishing trips in Oregon.",
    photo: 'winterSteelhead',
    includes: fishIncludes,
  },
  {
    slug: 'oregon-fishing-charter-half-day-trip',
    name: 'Half Day Trip',
    short: 'Quick & productive action',
    hours: 4,
    price: 150,
    boat: 'Willy Predator',
    boatSpec: "22' Willy Predator",
    capacity: 6,
    kind: 'river',
    species: ['Chinook salmon', 'Steelhead', 'Seasonal species'],
    seoTitle: "Half Day Oregon River Fishing Charter",
    metaDescription: "Join our 4 hour Oregon river fishing charter aboard Willy Predator. Book your guided trip today.",
    tagline: '4-hour guided trip for quick, productive action',
    description:
      "Perfect for anglers short on time, this 4-hour trip aboard our Willy Predator offers a focused and efficient Oregon fishing charter experience. Ideal for targeting salmon, steelhead, or seasonal species, this trip delivers quality fishing with guidance from a professional Oregon fishing guide who knows where to find active fish. Whether you're new to fishing or looking for a quick outing, this is one of the most convenient guided fishing trips in Oregon.",
    photo: 'salmonOnBoat',
    includes: fishIncludes,
  },
  {
    slug: 'oregon-fishing-charter-half-day-drift-boat-trip',
    name: 'Half Day Drift Boat',
    short: 'Steelhead & scenic trips',
    hours: 4,
    price: 150,
    boat: 'Alumaweld Guide Model',
    boatSpec: "16' Alumaweld drift boat",
    capacity: 3,
    kind: 'drift',
    species: ['Steelhead', 'Seasonal species'],
    seoTitle: "Oregon Half Day Drift Boat Fishing Charter",
    metaDescription: "Expert guided 4-hour Oregon river fishing charter aboard Alumaweld drift boat. Book today!",
    tagline: '4-hour drift-boat steelhead and scenic river trip',
    description:
      "Perfect for a shorter outing, this 4-hour trip aboard our Alumaweld Guide Model offers a focused and relaxing Oregon fishing charter experience on scenic rivers. Ideal for targeting steelhead and seasonal river species, this trip is guided by an experienced Oregon fishing guide who knows how to maximize opportunities even in a shorter window. Designed for small groups, it’s one of the most convenient and enjoyable guided fishing trips in Oregon for beginners, families, or anglers with limited time.",
    photo: 'steelheadRiverbank',
    includes: fishIncludes,
  },
  {
    slug: 'oregon-crabbing-charter-bdc-guide-service',
    name: 'Crabbing Charter (Willy Predator)',
    short: 'Dungeness crab & family fun',
    hours: 5,
    price: 150,
    boat: 'Willy Predator',
    boatSpec: "22' Willy Predator",
    capacity: 5, // the owner's booking rate for this trip caps at 5 (boat seats 6)
    kind: 'crab',
    species: ['Dungeness crab'],
    season: 'October through December',
    seoTitle: "Oregon Coast Crabbing Charter | 5-Hour Dungeness Crab Trip",
    metaDescription: "Join BDC's Oregon crabbing charter. Harvest fresh Dungeness crab with expert guides. Book now!",
    tagline: '5-hour fall crabbing trip for fresh Dungeness crab',
    description:
      "Join BDC Guide Service for a hands-on Oregon crabbing charter during peak season from October through December aboard our Willy Predator sled. This 5-hour trip is perfect for families, beginners, and anyone looking to enjoy a fun and rewarding day harvesting fresh Dungeness crab along the Oregon Coast. With guidance from an experienced Oregon fishing guide, you’ll learn proven crabbing techniques while enjoying one of the most popular seasonal guided fishing trips in Oregon.",
    photo: 'dungenessCrab',
    includes: crabIncludes,
  },
  {
    slug: 'oregon-crabbing-charter-5-hour-adventure',
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
    seoTitle: "Expert Guided Oregon Crabbing Charter",
    metaDescription: "Join BDC Guide Service for 5 hour Oregon crabbing trips. Target fresh Dungeness crab.",
    tagline: '5-hour crabbing trip with a river-and-coast twist',
    description:
      "Experience a unique take on Oregon crabbing trips with BDC Guide Service aboard our Alumaweld Guide Model during the fall season from October through December. This 5-hour trip offers a more intimate and hands-on Oregon crabbing charter, perfect for small groups looking for a relaxed and personalized outing. Guided by an experienced Oregon fishing guide, you’ll enjoy a fun and educational experience while targeting fresh Dungeness crab in select accessible areas.",
    photo: 'dungenessCrab',
    includes: crabIncludes,
  },
];

export const tripBySlug = (slug: string) => TRIPS.find((t) => t.slug === slug)!;
export const priceLabel = (n: number) => `$${n}`;
