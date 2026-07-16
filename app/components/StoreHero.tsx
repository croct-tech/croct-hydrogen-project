import {Link} from 'react-router';
import {useCroct, type SlotContent} from '@croct/plug-hydrogen';

/**
 * Homepage hero with content delivered by Croct.
 *
 * The content comes from the `home-hero` slot fetched server-side in the
 * homepage loader, allowing per-visitor variants and A/B tests of the copy,
 * image, and call to action.
 */
export function StoreHero({content}: {content: SlotContent<'home-hero@2'>}) {
  const croct = useCroct();
  const cta = content.cta[0];

  return (
    <section className="store-hero">
      <div className="store-hero-content">
        <h1>{content.headline}</h1>
        {content.tagline != null && (
          <p className="store-hero-tagline">{content.tagline}</p>
        )}
        {cta != null && (
          <Link
            className="store-hero-cta"
            to={cta.link}
            onClick={() =>
              void croct.track('goalCompleted', {goalId: 'hero-cta-click'})
            }
          >
            {cta.label}
          </Link>
        )}
      </div>
      <div className="store-hero-media">
        <img className="store-hero-image" src={content.image} alt="" />
      </div>
    </section>
  );
}
