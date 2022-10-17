import UserGalleryCollections from 'scenes/UserGalleryPage/UserGalleryCollections';
import { useIsMobileWindowWidth } from 'hooks/useWindowSize';
import useMobileLayout from 'hooks/useMobileLayout';
import EmptyGallery from 'scenes/UserGalleryPage/EmptyGallery';
import UserGalleryHeader from 'scenes/UserGalleryPage/UserGalleryHeader';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { UserGalleryLayoutFragment$key } from '__generated__/UserGalleryLayoutFragment.graphql';
import { UserGalleryLayoutQueryFragment$key } from '__generated__/UserGalleryLayoutQueryFragment.graphql';
import styled from 'styled-components';
import { useGlobalLayoutActions } from 'contexts/globalLayout/GlobalLayoutContext';
import { useEffect } from 'react';
import NavActionFollow from 'components/Follow/NavActionFollow';
import { VStack } from 'components/core/Spacer/Stack';
import breakpoints from 'components/core/breakpoints';

type Props = {
  userRef: UserGalleryLayoutFragment$key;
  queryRef: UserGalleryLayoutQueryFragment$key;
};

export const UserGalleryLayout = ({ userRef, queryRef }: Props) => {
  const query = useFragment(
    graphql`
      fragment UserGalleryLayoutQueryFragment on Query {
        ...UserGalleryCollectionsQueryFragment
        ...NavActionFollowQueryFragment
        ...UserGalleryHeaderQueryFragment
      }
    `,
    queryRef
  );

  const user = useFragment(
    graphql`
      fragment UserGalleryLayoutFragment on GalleryUser {
        username
        galleries {
          collections {
            __typename
          }

          ...UserGalleryCollectionsFragment
        }

        ...NavActionFollowUserFragment

        ...UserGalleryHeaderFragment
      }
    `,
    userRef
  );

  const isMobile = useIsMobileWindowWidth();
  const showMobileLayoutToggle = Boolean(isMobile && user.galleries?.[0]?.collections?.length);
  const { mobileLayout, setMobileLayout } = useMobileLayout();

  const [gallery] = user.galleries ?? [];

  const collectionsView = gallery?.collections ? (
    <UserGalleryCollections queryRef={query} galleryRef={gallery} mobileLayout={mobileLayout} />
  ) : (
    <EmptyGallery message="This user has not set up their gallery yet." />
  );

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
    <StyledUserGalleryLayout>
      <UserGalleryHeader
        userRef={user}
        queryRef={query}
        showMobileLayoutToggle={showMobileLayoutToggle}
        isMobile={isMobile}
        mobileLayout={mobileLayout}
        setMobileLayout={setMobileLayout}
      />
      <VStack gap={32} align="center" justify="center" grow>
        {collectionsView}
      </VStack>
    </StyledUserGalleryLayout>
  );
};

export const StyledUserGalleryLayout = styled(VStack)`
  width: 100%;
  max-width: 1200px;
  padding: 48px 0 32px;

  @media only screen and ${breakpoints.tablet} {
    padding: 80px 0 32px;
  }
`;
