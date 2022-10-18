import { useIsMobileWindowWidth } from 'hooks/useWindowSize';
import useMobileLayout from 'hooks/useMobileLayout';
import UserGalleryHeader from 'scenes/UserGalleryPage/UserGalleryHeader';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';
import { useGlobalLayoutActions } from 'contexts/globalLayout/GlobalLayoutContext';
import { useEffect } from 'react';
import NavActionFollow from 'components/Follow/NavActionFollow';
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

  const isMobile = useIsMobileWindowWidth();
  const { mobileLayout, setMobileLayout } = useMobileLayout();

  const { setCustomNavLeftContent } = useGlobalLayoutActions();

  useEffect(() => {
    setCustomNavLeftContent(<NavActionFollow userRef={user} queryRef={query} />);

    return () => {
      // [GAL-302] figure out a cleaner way to do this. prevent dismount of follow icon
      // if we're transitioning in between pages on the same user. otherwise there's a
      // race condition between this page trying to dismount the follow icon vs. the next
      // page trying to mount it again
      if (window.location.href.includes(user.username ?? '')) {
        return;
      }
      setCustomNavLeftContent(null);
    };
  }, [query, setCustomNavLeftContent, user]);

  return (
    <StyledUserGalleryLayout align="center">
      <UserGalleryHeader
        userRef={user}
        queryRef={query}
        showMobileLayoutToggle={false}
        isMobile={isMobile}
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

  @media only screen and ${breakpoints.desktop} {
    width: ${FEED_MAX_WIDTH}px;
  }
`;
