// Booking terms, exactly as BDC Guide Service publishes them on its trip pages and captain page
// (bdcguideservices.com "Good to Knows"). Spelling and punctuation are normalised, wording is unchanged.
// Anything not in this file is NOT a stated policy: do not add refund, weather or age rules here without the owner's approval.
export const BOOKING_TERMS = {
  includes: ['Rods, reels and tackle', 'Live bait (when applicable)'],
  bring: ['Hat, sunscreen, polarized sunglasses', 'Weather-appropriate clothing', 'Food and drinks'],
  deposit: 'A deposit is required for all bookings and will be applied at checkout.',
  balance: 'The remaining balance is due on the trip date as either credit or cash.',
  guestCancellation:
    'In the event that you must cancel your booking, you must do so 7 days prior to your trip date to receive a refund on your deposit. Rescheduling is encouraged and dependent on guide availability.',
  guideCancellation:
    'In the rare event that your guide must cancel due to inclement weather, health, or equipment issues, you will have the option to reschedule your charter for a later date or receive a refund on your deposit.',
  tipping: 'Tips to your guide are greatly appreciated for your quality trip.',
} as const;

// Regulatory statements, each with its source. Re-check before launch: regulations change every year.
export const REGULATIONS = {
  license:
    'An Oregon fishing license is required for anyone aged 12 or older. All anglers (regardless of age) need a valid angling tag and must follow regulations on recording harvest.',
  columbiaEndorsement:
    'All anglers, regardless of age, must have in possession a valid Columbia River Basin Endorsement when angling for salmon, steelhead and sturgeon in the mainstem Columbia River, and in all rivers and their tributaries that flow into the Columbia River.',
  shellfish: 'Everyone 12 years and older needs a license to harvest shellfish.',
  oceanCrabClosure: 'Ocean waters are closed for crab Oct. 16 - Nov. 30. Bays, beaches, estuaries, tide pools, piers and jetties are open all year.',
  keeperSize: 'We are looking for male Dungeness crab measuring at least 5¾ inches across the shell. Female crabs always go back.',
  sources: {
    license: 'BDC Guide Service FAQ (bdcguideservices.com/fishing-faqs)',
    shellfish: 'ODFW, Oregon shellfish regulations (myodfw.com/articles/oregon-shellfish-regulations), page updated January 5, 2024',
    keeperSize: 'BDC Guide Service crabbing charter page',
  },
} as const;
