import { Route } from 'nextjs-routes';
import styled from 'styled-components';

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
    <StyledGalleryLink
      to={link}
      eventElementId="Username Link"
      eventName="Username Link Click"
      eventContext={eventContext}
    >
      <StyledText as="span">{username ?? '<unknown>'}</StyledText>
    </StyledGalleryLink>
  );
}

const StyledGalleryLink = styled(GalleryLink)`
  display: flex;
  align-items: flex-start;
`;
const StyledText = styled(TitleS)`
  line-height: 1;
  display: inline-flex;
`;
