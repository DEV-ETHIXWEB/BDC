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
    weight: '1-3 lb',
    length: '6-9 in',
    habitat: 'Sandy and eelgrass bottoms in bays and nearshore waters',
    season: 'Our crabbing charters run October through December.',
    technique: 'Baited pots and rings pulled by hand, with the captain sorting keepers.',
    tip: 'Bring a cooler and a hungry family: it is the freshest crab you will ever eat.',
    icon: 'crab',
    photo: 'dungenessCrab',
  },
] as const;

export const FAQS = [
  {
    q: 'Where does BDC Guide Service fish?',
    a: 'We fish the Oregon area, including Eagle Creek, Lithgow Creek, Clear Creek, Deep Creek, Clackamette Cove, Eda Creek and Van Zyl Reservoir, plus the big rivers below.',
  },
  {
    q: 'What rivers do you fish in Oregon?',
    a: 'BDC Guide Service fishes several top Oregon rivers, including the Columbia, Willamette, Wilson, Trask, Sandy, Clackamas and Nestucca.',
  },
  { q: 'What are the target fish?', a: 'Target fish include winter steelhead, spring salmon and, in fall, Dungeness crab.' },
  {
    q: 'Where do we meet our guests?',
    a: 'We meet at 9018 Southeast Bridge Crk Ct, Happy Valley, OR 97015, USA.',
  },
  { q: 'Do I need a state fishing license?', a: 'Yes, a fishing license is required.' },
  {
    q: 'Where do I get a state fishing license?',
    a: 'Contact the Oregon Department of Fish & Wildlife. An Oregon fishing license is required for anyone aged 12 or older, and some waters need additional endorsements.',
  },
  { q: 'How much should I tip?', a: 'It is customary to tip 20% of the trip total.' },
  {
    q: 'Do I need to bring my own gear?',
    a: "No. We provide standard gear such as rods and reels so you don't need to worry about anything.",
  },
  {
    q: 'How early do fishing trips start?',
    a: 'Trips can begin as early as 4:00 AM, especially for salmon fishing when early morning conditions are most productive.',
  },
  {
    q: 'How many people can join a fishing trip?',
    a: 'The Willy Predator accommodates up to 6 anglers (often limited to 4 for comfort), while the Alumaweld drift boat takes up to 3 guests for a more intimate experience.',
  },
] as const;
