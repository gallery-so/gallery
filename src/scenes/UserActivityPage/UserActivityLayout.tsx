import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { VStack } from '~/components/core/Spacer/Stack';
import { FEED_MAX_WIDTH } from '~/components/Feed/dimensions';
import { UserActivityLayoutFragment$key } from '~/generated/UserActivityLayoutFragment.graphql';
import { UserActivityLayoutQueryFragment$key } from '~/generated/UserActivityLayoutQueryFragment.graphql';
import { StyledUserGalleryLayout } from '~/scenes/UserGalleryPage/UserGalleryLayout';

import UserActivityFeed from './UserActivityFeed';

type Props = {
  userRef: UserActivityLayoutFragment$key;
  queryRef: UserActivityLayoutQueryFragment$key;
};

export const UserActivityLayout = ({ userRef, queryRef }: Props) => {
  const query = useFragment(
    graphql`
      fragment UserActivityLayoutQueryFragment on Query
      @refetchable(queryName: "UserGalleryFeedRefreshQuery") {
        ...NavActionFollowQueryFragment
        ...UserActivityFeedQueryFragment
      }
    `,
    queryRef
  );

  const user = useFragment(
    graphql`
      fragment UserActivityLayoutFragment on GalleryUser {
        username

        ...NavActionFollowUserFragment

        ...UserGalleryHeaderFragment

        ...UserActivityFeedFragment
      }
    `,
    userRef
  );

  return (
    <StyledUserGalleryLayout align="center">
      <StyledUserActivityLayout gap={32}>
        <UserActivityFeed userRef={user} queryRef={query} />
      </StyledUserActivityLayout>
    </StyledUserGalleryLayout>
  );
};

const StyledUserActivityLayout = styled(VStack)`
  margin: 0 -16px;
  padding-top: 24px;
  width: 100vw;

  @media only screen and ${breakpoints.desktop} {
    width: ${FEED_MAX_WIDTH}px;
  }
`;
