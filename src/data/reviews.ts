// Real guest reviews, typed in by hand from a verified source.
//
// THE ONE RULE: every entry here must be something a real guest actually wrote. Copy it from his
// Google Business Profile, a Facebook recommendation, or an email the guest sent, and keep their
// words. Do not write a review, do not improve one, do not pad the list to look busier.
//
// This is not squeamishness. Invented testimonials are illegal in the US: the FTC's rule on fake
// reviews carries a penalty per violation, and Google removes profiles and can suspend a Business
// Profile outright for review manipulation. A guide service lives on its reputation, so the
// downside is not a fine, it is the business.
//
// Presentation is a different matter and is fair game: four genuine reviews scrolling in a wall
// look generous, and nothing claims there are more than there are.
//
// Google reviews arrive separately and automatically through /api/reviews. Use this file for
// reviews that live somewhere Google cannot see: Facebook, email, a text message.

export interface ManualReview {
  /** The guest's name as they are happy to be shown. */
  name: string;
  /** Their words, unedited. Trim only whitespace. */
  text: string;
  rating?: 1 | 2 | 3 | 4 | 5;
  /** Free text, e.g. "August 2026". Shown as given. */
  when?: string;
  /** Where it came from, so it can be checked later: 'Facebook' | 'Email' | 'Google' */
  source?: string;
  /** Which trip, when the guest said. Never guessed. */
  trip?: string;
}

// Transcribed from the Google Business Profile dashboard on 28 October 2026, which showed 5.0 from
// 5 reviews. These are here so they appear immediately; once GOOGLE_PLACES_API_KEY and
// GOOGLE_PLACE_ID are set, /api/reviews becomes the live source and these are de-duplicated away by
// reviewer name, so nothing shows twice and new reviews arrive without anyone editing this file.
export const MANUAL_REVIEWS: ManualReview[] = [
  {
    name: 'John doe',
    text: 'I had a great time learning about salmon fishing with Clinton. He really explained it well and put us on the fish. It was a great day and I will definitely be back.',
    rating: 5,
    when: 'October 2026',
    source: 'Google',
  },
  {
    name: 'Troy Lovell',
    text:
      'I can’t say enough good things about Captain Clint. His knowledge of ocean salmon fishing and local river runs is truly top-notch. Safety was a major priority throughout the trip. From the moment we started, he provided clear, practical instruction on selecting the right gear, setting up our tackle, reading the water, and adjusting our technique to the conditions. He explained why each decision mattered, making the experience both productive and educational.'
      + '\n\n'
      + 'Captain Clint knew exactly where to look for fish and how to adapt as the tide, current, and weather changed, while always keeping safety at the forefront. His patience, attention to detail, and careful guidance made us feel confident and secure throughout the trip. His enthusiasm for salmon fishing was contagious. Whether you’re a first-time angler or an experienced fisherman, you’ll learn something new and enjoy every minute on the water. I can’t wait to fish with him again!',
    rating: 5,
    when: 'October 2026',
    source: 'Google',
  },
  {
    name: 'Bruce Charter',
    text: 'I went fishing with Captain Clint in early August. I was early but he was already in the boat and ready. Clint is very organized and I found him very knowledgeable. He put us on the fish when most boat\u2019s weren\u2019t doing well. Clint made sure I was comfortable and having a good time! I would recommend him to anyone who wants to go catch some fish!',
    rating: 5,
    when: 'October 2026',
    source: 'Google',
  },
  {
    // The dashboard truncated this one at "as it was...". Only the part actually visible is used,
    // with an ellipsis, because the rest of a guest's sentence is not ours to write. Paste the full
    // text over this when someone opens the review on Google.
    name: 'Ryan Taylor',
    text: 'My wife & I had a blast fishing with Clinton in Astoria. Thanks for being so professional & patient with her as it was\u2026',
    rating: 5,
    when: 'October 2026',
    source: 'Google',
  },
  // Lance Mcculloch also left 5 stars on the same profile, with no written text. It counts toward
  // the rating and the total below, but there is no quote to show, so it gets no card.
];

/** What the Google Business Profile showed on 28 October 2026. Used for the rating markup. */
export const REVIEW_SUMMARY = { rating: 5.0, total: 5, checked: '2026-10-28' };
