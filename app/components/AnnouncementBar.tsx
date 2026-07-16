import {Link} from 'react-router';
import {useCroct, type SlotContent} from '@croct/plug-hydrogen';

/**
 * Site-wide announcement bar with content delivered by Croct.
 *
 * The content comes from the `site-wide-top-bar` slot fetched server-side in
 * the root loader, so different visitors can see different announcements
 * without any flicker.
 */
export function AnnouncementBar({
  content,
}: {
  content: SlotContent<'site-wide-top-bar@3'>;
}) {
  const croct = useCroct();
  const cta = content.cta?.[0];

  return (
    <div className="announcement-bar">
      <p>
        {content.text}{' '}
        {cta != null && (
          <Link
            to={cta.link}
            onClick={() =>
              void croct.track('goalCompleted', {
                goalId: 'announcement-bar-click',
              })
            }
          >
            {cta.label}
          </Link>
        )}
      </p>
    </div>
  );
}
