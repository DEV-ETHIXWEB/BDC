// Honest season status derived from the date, using only facts from the captain:
// steelhead Jan-Apr, spring/early-summer Chinook (more in fall), crab Oct-Dec,
// trips scheduled from the 3rd week of September.
export interface SeasonStatus { state: 'open' | 'soon'; label: string; detail: string }

export function seasonStatus(now: Date = new Date()): SeasonStatus {
  const m = now.getMonth() + 1;
  const d = now.getDate();
  if (m === 9 && d >= 15) return { state: 'open', label: 'Now booking', detail: 'Fall Chinook trips are on the calendar. Crab opens in October.' };
  if (m === 9 || m === 8) return { state: 'soon', label: 'Fall trips start soon', detail: 'Trips are scheduled from the 3rd week of September.' };
  if (m >= 10) return { state: 'open', label: 'Crab season is open', detail: 'Dungeness crab runs October through December, with fall Chinook.' };
  if (m <= 4) return { state: 'open', label: 'Steelhead season', detail: 'Winter steelhead runs January through April.' };
  return { state: 'open', label: 'Chinook season', detail: 'Spring and early-summer Chinook, with more fish in fall.' };
}
