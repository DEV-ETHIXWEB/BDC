// Season status derived from the date, using the months Captain Clinton gave on the 2026 review call
// (src/data/seasons.ts): steelhead January through April, spring and early Chinook March through July,
// fall salmon August through November with fall Chinook August through October, crab October through
// December. The season opens August 1. It never claims a species is biting.
export interface SeasonStatus { state: 'open' | 'soon'; label: string; detail: string }

export function seasonStatus(now: Date = new Date()): SeasonStatus {
  const m = now.getMonth() + 1;
  if (m >= 8 && m <= 10) return { state: 'open', label: 'Fall Chinook', detail: 'The season opens August 1. Fall Chinook runs August through October.' };
  if (m === 11) return { state: 'open', label: 'Fall salmon and crab', detail: 'Fall salmon runs through November and crabbing charters run October through December.' };
  if (m === 12) return { state: 'open', label: 'Crab charters', detail: 'Crabbing charters run October through December.' };
  if (m <= 2) return { state: 'open', label: 'Winter steelhead', detail: 'Winter (January through April) is prime for steelhead.' };
  if (m <= 4) return { state: 'open', label: 'Steelhead and spring Chinook', detail: 'Winter steelhead runs through April and spring Chinook starts in March.' };
  return { state: 'open', label: 'Spring and early Chinook', detail: 'Spring and early Chinook run March through July. The fall season opens August 1.' };
}
