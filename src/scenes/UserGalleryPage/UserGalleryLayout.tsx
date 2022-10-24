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
import { VStack } from 'components/core/Spacer/Stack';
import breakpoints from 'components/core/breakpoints';
import { useRef } from 'react';
import { List } from 'react-virtualized';

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

  const virtualizedListRef = useRef<List>(null);

  const collectionsView = gallery?.collections ? (
    <UserGalleryCollections
      ref={virtualizedListRef}
      queryRef={query}
      galleryRef={gallery}
      mobileLayout={mobileLayout}
    />
  ) : (
    <EmptyGallery message="This user has not set up their gallery yet." />
  );

  return (
    <StyledUserGalleryLayout>
      <UserGalleryHeader
        userRef={user}
        queryRef={query}
        showMobileLayoutToggle={showMobileLayoutToggle}
        mobileLayout={mobileLayout}
        setMobileLayout={setMobileLayout}
      />
      <VStack gap={32} align="center" justify="center" grow>
        {collectionsView}
      </VStack>
    </StyledUserGalleryLayout>
  );
};

const StyledUserGalleryLayout = styled(VStack)`
  width: 100%;
  max-width: 1200px;
  padding: 8px 0 32px;

  @media only screen and ${breakpoints.tablet} {
    padding: 80px 0 32px;
  }
`;
