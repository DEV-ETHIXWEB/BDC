import { useEffect, useState } from 'react';
import { Icon } from './Icon';

// Renders whatever /api/reviews returns. While the endpoint has no Google key configured it returns an
// empty list, this renders nothing, and the page keeps its "send us a review" invitation. The moment the
// key is set the reviews appear on their own, with no redeploy.

interface Review { name: string; text: string; rating?: number; when?: string; url?: string }
interface Payload { configured: boolean; reviews: Review[]; place?: { name: string; rating: number | null; total: number | null; url: string } }

export default function GoogleReviews({ inviteId = 'gb-invite' }: { inviteId?: string }) {
  const [data, setData] = useState<Payload | null>(null);

  useEffect(() => {
    let dead = false;
    fetch('/api/reviews', { headers: { Accept: 'application/json' } })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: Payload | null) => { if (!dead) setData(d); })
      .catch(() => { /* leave the invitation in place */ });
    return () => { dead = true; };
  }, []);

  const reviews = data?.reviews ?? [];

  // The invitation is server-rendered so it is there with JavaScript off; hide it only once real reviews load.
  useEffect(() => {
    const invite = document.getElementById(inviteId);
    if (invite) invite.hidden = reviews.length > 0;
  }, [reviews.length, inviteId]);

  if (!reviews.length) return null;
  const place = data?.place;

  return (
    <div className="gr">
      {place && (place.rating || place.total) && (
        <p className="gr__summary">
          {place.rating != null && (
            <span className="gr__score" aria-label={`Rated ${place.rating} out of 5 on Google`}>
              <Icon name="star" size={18} />{place.rating.toFixed(1)}
            </span>
          )}
          {place.total != null && <span>{place.total} Google review{place.total === 1 ? '' : 's'}</span>}
          {place.url && <a href={place.url} target="_blank" rel="noopener noreferrer">Read them on Google</a>}
        </p>
      )}

      <ul className="gb-wallr" data-stagger>
        {reviews.map((r, i) => (
          <li key={i} className="gb-rev" style={{ ['--tilt' as string]: `${[-0.5, 0.4, -0.3][i % 3]}deg` }}>
            <figure>
              <span className="gb-rev__mark" aria-hidden="true">&ldquo;</span>
              {r.rating ? (
                <p className="gb-rev__stars" role="img" aria-label={`${r.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }, (_, k) => (
                    <Icon key={k} name="star" size={18} className={k < r.rating! ? 'is-on' : 'is-off'} />
                  ))}
                </p>
              ) : null}
              <blockquote>{r.text}</blockquote>
              <figcaption>
                <strong>{r.name}</strong>
                <span className="gb-rev__tag">Google review</span>
                {r.when && <span className="gb-rev__meta">{r.when}</span>}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      {/* Google requires the source to be named and linked wherever its reviews are shown. */}
      <p className="gr__attrib">
        Reviews from Google{place?.url && <> &middot; <a href={place.url} target="_blank" rel="noopener noreferrer">see all on Google Maps</a></>}
      </p>
    </div>
  );
}
