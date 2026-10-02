// Species figures, seasons and tips. Chinook, steelhead and crab come from the previous bdcguideservices.com
// "Target Species" page; the months were corrected by Captain Clinton on the 2026 review call (see
// src/data/seasons.ts). American shad and sturgeon were added on that call: he gave no sizes and no months
// for them, so no figures are shown and their season copy says the window is not confirmed yet.
// `featured` marks the three species shown in the homepage field guide; the Target Species page shows all of them.
export const SPECIES = [
  {
    slug: 'chinook-salmon',
    name: 'Chinook Salmon',
    latin: 'Oncorhynchus tshawytscha',
    family: 'Salmonidae',
    weight: '10-50 lb',
    length: '30-59 in',
    habitat: 'Onshore, nearshore, river and lake environments',
    season:
      'Spring and early Chinook run March through July on the Columbia and Willamette rivers. Fall salmon follow from August through November, with fall Chinook strongest August through October.',
    technique:
      'Trolling with herring, spinners or plugs is highly effective for salmon, especially on the Columbia River.',
    tip: 'Presentation and depth control are key. The spring run rolls almost straight into the fall run, with only about a three-week gap between them.',
    icon: 'fish',
    photo: 'chinookLake',
    featured: true,
  },
  {
    slug: 'steelhead-trout',
    name: 'Steelhead Trout',
    latin: 'Oncorhynchus mykiss',
    family: 'Salmonidae',
    weight: '2-35 lb',
    length: '12-46 in',
    habitat: 'Coastal rivers',
    season:
      'Winter (January through April) is prime for steelhead fishing, especially on coastal and tributary rivers.',
    technique: 'Drift fishing on the Wilson, Trask, Sandy, Clackamas and Nestucca rivers.',
    tip: 'Early mornings and tide-influenced windows often produce the best bites when river conditions align.',
    icon: 'fishJump',
    photo: 'winterSteelhead',
    featured: true,
  },
  {
    slug: 'american-shad',
    name: 'American Shad',
    latin: 'Alosa sapidissima',
    family: 'Clupeidae',
    weight: null,
    length: null,
    habitat: 'Runs up the Columbia and Willamette rivers from the ocean',
    season:
      'Shad push into the Columbia and Willamette in early summer. Captain Clinton has not set this year’s window yet, so call for current dates.',
    technique: 'Light tackle with small darts, grubs and shad flies worked near the bottom in the current.',
    tip: 'Shad come through in numbers, which makes them one of the best trips for kids and first-time anglers.',
    icon: 'salmon',
    photo: null,
    featured: false,
  },
  {
    slug: 'sturgeon',
    name: 'Sturgeon',
    latin: 'Acipenser transmontanus',
    family: 'Acipenseridae',
    weight: null,
    length: null,
    habitat: 'Columbia River and its lower tributaries',
    season:
      'Catch-and-release sturgeon trips run all year. Retention is only open for short announced periods, usually a two-day opener, so most sturgeon trips are catch and release.',
    technique: 'Anchored up over deep water with bait on the bottom, heavy rods and a steady hand.',
    tip: 'Catch and release is legal in Oregon all year, so a sturgeon trip is still on the table when retention is closed.',
    icon: 'steelhead',
    photo: null,
    featured: false,
  },
  {
    slug: 'dungeness-crab',
    name: 'Dungeness Crab',
    latin: 'Metacarcinus magister',
    family: 'Cancridae',
    weight: null,
    length: null,
    habitat: null,
    season: 'Our crabbing charters run October through December.',
    technique: 'Crab pots with fresh bait. Captain Clinton shows you how to bait a pot and how to tell legal keepers from the ones that go back.',
    tip: 'Keepers are male Dungeness crab at least 5¾ inches across the shell. Female crabs always go back.',
    icon: 'crab',
    photo: 'dungenessCrab',
    featured: true,
  },
] as const;

export const FEATURED_SPECIES = SPECIES.filter((s) => s.featured);

// The ten questions and answers from the previous site's FAQ page, wording unchanged except three obvious typos
// ("Where in Oregon to we meet" -> "do we", "12 year" -> "12 years", "bring you own gear" -> "your own gear").
// Two answers were updated on the 2026 review call: the target-fish list now covers every species he fishes, and
// the meeting place no longer prints a street address because the one on the old site was not his.
export const FAQS = [
  {
    q: 'Where does BDC Guide Service fish?',
    a: 'We fish the Oregon area, including Eagle Creek, Lithgow Creek, Clear Creek, Deep Creek, Clackamette Cove, Eda Creek, Van Zyl Reservoir.',
  },
  {
    q: 'What are the target fish?',
    a: 'Target fish include winter steelhead, spring and early Chinook salmon, fall salmon, American shad, sturgeon (catch and release) and Dungeness crab.',
  },
  {
    q: 'Where in Oregon do we meet our guests?',
    a: 'Captain Clinton gives you the exact meeting spot and launch time when you book, because it changes with the season and the river. Call or email and he will confirm it with you.',
  },
  { q: 'Do I need a state fishing license?', a: 'Yes, a Fishing license is required' },
  {
    q: 'Where do I get a state fishing license?',
    a: 'Oregon Department of Fish & Wildlife - Fishing An Oregon fishing license is required for anyone aged 12 years or older. All anglers (regardless of age) need a valid angling tag and must follow regulations on recording harvest. All anglers, regardless of age, must have in possession a valid Columbia River Basin Endorsement when angling for salmon, steelhead and sturgeon in the mainstem Columbia River, and in all rivers and their tributaries that flow into the Columbia River. Please visit the Oregon Department of Fish & Wildlife website for more information and to purchase your license.',
  },
  { q: 'How much should I tip?', a: 'It is customary to tip 20% of the trip total. We work tirelessly to make sure you have a guest experience!' },
  {
    q: 'Do I need to bring my own gear?',
    a: "No, we provide standard gear such as rods and reels so you don’t need to worry about anything. But please feel free to bring your own gear if you prefer.",
  },
  {
    q: 'What rivers do you fish in Oregon?',
    a: 'BDC Guide Service fishes several top Oregon rivers, including the Columbia, Willamette, Wilson, Trask, Sandy, Clackamas, and Nestucca. The exact location depends on the season and where fish are actively biting.',
  },
  {
    q: 'How early do fishing trips start?',
    a: 'Trips can begin as early as 4:00 AM, especially for salmon fishing when early morning conditions are most productive. Start times are adjusted based on the season and target species.',
  },
  {
    q: 'How many people can join a fishing trip?',
    a: 'Group size depends on the boat used. The Willy Predator can take up to 6 anglers (often limited to 4 for comfort), while the Alumaweld drift boat accommodates up to 3 guests for a more personal experience.',
  },
] as const;
