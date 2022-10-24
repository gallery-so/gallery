import useMobileLayout from 'hooks/useMobileLayout';
import UserGalleryHeader from 'scenes/UserGalleryPage/UserGalleryHeader';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';
import { VStack } from 'components/core/Spacer/Stack';
import UserActivityFeed from './UserActivityFeed';
import { UserActivityLayoutQueryFragment$key } from '__generated__/UserActivityLayoutQueryFragment.graphql';
import { UserActivityLayoutFragment$key } from '__generated__/UserActivityLayoutFragment.graphql';
import { StyledUserGalleryLayout } from 'scenes/UserGalleryPage/UserGalleryLayout';
import { FEED_MAX_WIDTH } from 'components/Feed/dimensions';
import breakpoints from 'components/core/breakpoints';

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
        ...UserGalleryHeaderQueryFragment
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

  const { mobileLayout, setMobileLayout } = useMobileLayout();

  return (
    <StyledUserGalleryLayout align="center">
      <UserGalleryHeader
        userRef={user}
        queryRef={query}
        showMobileLayoutToggle={false}
        mobileLayout={mobileLayout}
        setMobileLayout={setMobileLayout}
      />
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
