// Season status derived from the date. Uses ONLY statements the captain published (steelhead January through April,
// crab October through December, trips scheduled from the 3rd week of September). It never claims a species is biting.
export interface SeasonStatus { state: 'open' | 'soon'; label: string; detail: string }

export function seasonStatus(now: Date = new Date()): SeasonStatus {
  const m = now.getMonth() + 1;
  const d = now.getDate();
  if (m === 9 && d >= 15) return { state: 'open', label: 'Now booking', detail: 'Trips are scheduled from the 3rd week of September.' };
  if (m === 8 || m === 9) return { state: 'soon', label: 'Fall trips start soon', detail: 'Trips are scheduled from the 3rd week of September.' };
  if (m >= 10) return { state: 'open', label: 'Crab charters', detail: 'Crabbing charters run October through December.' };
  if (m <= 4) return { state: 'open', label: 'Winter steelhead', detail: 'Winter (January through April) is prime for steelhead.' };
  return { state: 'soon', label: 'Planning ahead', detail: 'Call Captain Clinton for current trip dates.' };
}
