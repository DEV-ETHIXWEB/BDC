// Single source of truth for fishing seasons. The months below are the ones Captain Clinton gave on the
// 2026 review call: winter steelhead January to April, spring and early Chinook March to July, fall salmon
// August to November (fall Chinook itself August to October), crab October to December. The season opens
// August 1 and the springer season rolls into the fall season with roughly a three-week gap.
// American shad and sturgeon are target species he added on that call; he did not give months for them, so
// those two bars stay flagged `approximate` until he confirms them.
export const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] as const;
export const MONTHS_SHORT = MONTHS_FULL.map((m) => m.slice(0, 3));

export interface Season {
  key: 'steelhead' | 'chinook' | 'fall' | 'shad' | 'sturgeon' | 'crab';
  name: string;
  short: string;
  /** 1-based, inclusive */
  start: number;
  end: number;
  /** true when the owner has not given months and the window is our reading */
  approximate: boolean;
  /** what the owner actually said */
  statedAs: string;
  note: string;
  /** additional opportunity rather than the prime window */
  light?: boolean;
}

export const SEASONS: Season[] = [
  { key: 'steelhead', name: 'Winter steelhead', short: 'Steelhead', start: 1, end: 4, approximate: false, statedAs: 'Winter (January through April)', note: 'Coastal and tributary rivers' },
  { key: 'chinook', name: 'Spring and early Chinook', short: 'Spring Chinook', start: 3, end: 7, approximate: false, statedAs: 'Spring and early Chinook is March through July', note: 'Columbia and Willamette rivers' },
  { key: 'fall', name: 'Fall salmon', short: 'Fall salmon', start: 8, end: 11, approximate: false, statedAs: 'Fall salmon would be August through November', note: 'Fall Chinook August to October' },
  { key: 'shad', name: 'American shad', short: 'Shad', start: 5, end: 7, approximate: true, statedAs: 'A target species, months not yet given', note: 'Columbia and Willamette rivers' },
  { key: 'sturgeon', name: 'Sturgeon', short: 'Sturgeon', start: 1, end: 12, approximate: true, statedAs: 'Catch and release all year; retention is usually a two-day opener', note: 'Catch and release', light: true },
  { key: 'crab', name: 'Dungeness crab charters', short: 'Crab', start: 10, end: 12, approximate: false, statedAs: 'October through December', note: '' },
];

export const season = (key: Season['key']) => SEASONS.find((s) => s.key === key)!;
/** 0-based month indexes covered by a season */
export const monthsOf = (s: Season) => Array.from({ length: s.end - s.start + 1 }, (_, i) => s.start - 1 + i);
export const rangeLabel = (s: Season) => `${MONTHS_SHORT[s.start - 1]} to ${MONTHS_SHORT[s.end - 1]}`;

/** The season opens August 1 (Captain Clinton, 2026 review call). */
export const SEASON_START = 'August 1';
export const SEASON_DISCLAIMER =
  'Chinook, steelhead and crab months come straight from Captain Clinton. Shad and sturgeon windows are our reading until he confirms them, and sturgeon retention is only open for short, announced periods. Runs shift with the river and the year: call before you plan around a date.';
