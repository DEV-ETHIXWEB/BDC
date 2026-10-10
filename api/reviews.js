// Pulls Google reviews for the business and hands them to the reviews page.
//
// It runs on the server for two reasons: the API key must never reach the browser, and the CDN can then
// cache one response for everyone. With s-maxage=6h that is about four calls to Google a day no matter how
// much traffic the page gets, which sits inside the free tier rather than burning quota per visitor.
//
// Dormant until GOOGLE_PLACES_API_KEY and GOOGLE_PLACE_ID are set: it answers with an empty list and the
// page keeps showing its "send us a review" invitation.
const ENDPOINT = 'https://places.googleapis.com/v1/places';
// Only what is actually rendered. A narrow field mask is also what keeps this on the cheapest SKU that
// still includes reviews.
const FIELDS = 'id,displayName,rating,userRatingCount,googleMapsUri,reviews';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const key = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!key || !placeId) {
    res.setHeader('Cache-Control', 'public, s-maxage=300');
    return res.status(200).json({ configured: false, reviews: [] });
  }

  try {
    const r = await fetch(`${ENDPOINT}/${encodeURIComponent(placeId)}`, {
      headers: { 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': FIELDS },
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) {
      const detail = await r.text().catch(() => '');
      console.error('reviews: places api', r.status, detail.slice(0, 200));
      res.setHeader('Cache-Control', 'public, s-maxage=60');
      return res.status(200).json({ configured: true, reviews: [], error: 'upstream' });
    }
    const d = await r.json();

    // Google returns at most 5 and picks them itself. Author photos are deliberately dropped: rendering
    // them would mean the visitor's browser calling googleusercontent.com, which breaks img-src 'self'
    // and reintroduces a third-party request on a site that currently makes none.
    const reviews = (d.reviews || [])
      .filter((v) => v?.text?.text || v?.originalText?.text)
      .map((v) => ({
        name: v.authorAttribution?.displayName || 'Google reviewer',
        text: (v.text?.text || v.originalText?.text || '').trim(),
        rating: typeof v.rating === 'number' ? Math.round(v.rating) : undefined,
        when: v.relativePublishTimeDescription || '',
        publishTime: v.publishTime || '',
        url: v.googleMapsUri || d.googleMapsUri || '',
      }));

    // Google's attribution policy: say where the reviews came from and link back.
    res.setHeader('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=86400');
    return res.status(200).json({
      configured: true,
      reviews,
      place: {
        name: d.displayName?.text || '',
        rating: d.rating ?? null,
        total: d.userRatingCount ?? null,
        url: d.googleMapsUri || '',
      },
    });
  } catch (e) {
    console.error('reviews: fetch failed', e);
    res.setHeader('Cache-Control', 'public, s-maxage=60');
    return res.status(200).json({ configured: true, reviews: [], error: 'unreachable' });
  }
}
