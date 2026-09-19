// Chinook and steelhead figures, seasons and tips are taken from the "Target Species" page of the previous
// bdcguideservices.com. The crab entry uses only what the owner's crabbing pages state (no size/weight/habitat figures
// are given there, so none are shown).
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
      'Spring and early summer bring strong Chinook runs on the Columbia and Willamette rivers, while fall can offer additional salmon opportunities.',
    technique:
      'Trolling with herring, spinners or plugs is highly effective for salmon, especially on the Columbia River.',
    tip: 'Presentation and depth control are key.',
    icon: 'fish',
    photo: 'chinookLake',
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
    tip: 'Keepers are male Dungeness crab at least 5\u00be inches across the shell. Female crabs always go back.',
    icon: 'crab',
    photo: 'dungenessCrab',
  },
] as const;

// The ten questions and answers from the previous site's FAQ page, wording unchanged except three obvious typos
// ("Where in Oregon to we meet" -> "do we", "12 year" -> "12 years", "bring you own gear" -> "your own gear").
export const FAQS = [
  {
    q: 'Where does BDC Guide Service fish?',
    a: 'We fish the Oregon area, including Eagle Creek, Lithgow Creek, Clear Creek, Deep Creek, Clackamette Cove, Eda Creek, Van Zyl Reservoir.',
  },
  { q: 'What are the target fish?', a: 'Target fish include Winter Steelhead, Spring Salmon' },
  { q: 'Where in Oregon do we meet our guests?', a: 'We meet at 9018 Southeast Bridge Crk Ct, Happy Valley, OR 97015, USA' },
  { q: 'Do I need a state fishing license?', a: 'Yes, a Fishing license is required' },
  {
    q: 'Where do I get a state fishing license?',
    a: 'Oregon Department of Fish & Wildlife - Fishing An Oregon fishing license is required for anyone aged 12 years or older. All anglers (regardless of age) need a valid angling tag and must follow regulations on recording harvest. All anglers, regardless of age, must have in possession a valid Columbia River Basin Endorsement when angling for salmon, steelhead and sturgeon in the mainstem Columbia River, and in all rivers and their tributaries that flow into the Columbia River. Please visit the Oregon Department of Fish & Wildlife website for more information and to purchase your license.',
  },
  { q: 'How much should I tip?', a: 'It is customary to tip 20% of the trip total. We work tirelessly to make sure you have a guest experience!' },
  {
    q: 'Do I need to bring my own gear?',
    a: "No, we provide standard gear such as rods and reels so you don\u2019t need to worry about anything. But please feel free to bring your own gear if you prefer.",
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
