// Single source of truth for fishing seasons. Every season is described by the captain in WORDS only (previous
// site, "Target Species" and trip pages). There is no month-by-month data from the owner: his platform calendar is
// all zeros. So exact months are given only where he states them (steelhead, crab); "spring and early summer" and
// "fall" are approximate readings and are labelled as such wherever they are drawn.
export const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] as const;
export const MONTHS_SHORT = MONTHS_FULL.map((m) => m.slice(0, 3));

export interface Season {
  key: 'steelhead' | 'chinook' | 'fall' | 'crab';
  name: string;
  short: string;
  /** 1-based, inclusive */
  start: number;
  end: number;
  /** true when the owner gave words ("spring and early summer") and the months are our reading of them */
  approximate: boolean;
  /** what the owner actually wrote */
  statedAs: string;
  note: string;
  /** additional opportunity rather than the prime window */
  light?: boolean;
}

export const SEASONS: Season[] = [
  { key: 'steelhead', name: 'Winter steelhead', short: 'Steelhead', start: 1, end: 4, approximate: false, statedAs: 'Winter (January through April)', note: 'Coastal and tributary rivers' },
  { key: 'chinook', name: 'Spring and early-summer Chinook', short: 'Chinook', start: 4, end: 7, approximate: true, statedAs: 'Spring and early summer', note: 'Columbia and Willamette rivers' },
  { key: 'fall', name: 'Fall salmon', short: 'Fall salmon', start: 9, end: 11, approximate: true, statedAs: 'Fall can offer additional salmon opportunities', note: 'Additional opportunities', light: true },
  { key: 'crab', name: 'Dungeness crab charters', short: 'Crab', start: 10, end: 12, approximate: false, statedAs: 'October through December', note: '' },
];

export const season = (key: Season['key']) => SEASONS.find((s) => s.key === key)!;
/** 0-based month indexes covered by a season */
export const monthsOf = (s: Season) => Array.from({ length: s.end - s.start + 1 }, (_, i) => s.start - 1 + i);
export const rangeLabel = (s: Season) => `${MONTHS_SHORT[s.start - 1]} to ${MONTHS_SHORT[s.end - 1]}`;

export const TRIPS_START = 'the 3rd week of September';
export const SEASON_DISCLAIMER =
  'Captain Clinton describes the salmon seasons in words (spring and early summer, fall), so those bars are approximate. Runs shift with the river and the year: call before you plan around a date.';
