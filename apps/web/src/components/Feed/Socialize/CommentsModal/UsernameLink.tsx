import { Route } from 'nextjs-routes';

import GalleryLink from '~/components/core/GalleryLink/GalleryLink';
import { TitleS } from '~/components/core/Text/Text';
import { GalleryElementTrackingProps } from '~/shared/contexts/AnalyticsContext';

type UsernameLinkProps = {
  username: string | null;
  eventContext: GalleryElementTrackingProps['eventContext'];
};

export function UsernameLink({ username, eventContext }: UsernameLinkProps) {
  const link: Route = username
    ? { pathname: '/[username]', query: { username } }
    : { pathname: '/' };

  return (
    <GalleryLink
      to={link}
      eventElementId="Username Link"
      eventName="Username Link Click"
      eventContext={eventContext}
    >
      <TitleS as="span">{username ?? '<unknown>'}</TitleS>
    </GalleryLink>
  );
}
