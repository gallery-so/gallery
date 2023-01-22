import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { VStack } from '~/components/core/Spacer/Stack';
import { UserGalleryLayoutFragment$key } from '~/generated/UserGalleryLayoutFragment.graphql';
import { UserGalleryLayoutQueryFragment$key } from '~/generated/UserGalleryLayoutQueryFragment.graphql';
import useMobileLayout from '~/hooks/useMobileLayout';
import { useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import EmptyGallery from '~/scenes/UserGalleryPage/EmptyGallery';
import UserGalleryCollections from '~/scenes/UserGalleryPage/UserGalleryCollections';
import UserGalleryHeader from '~/scenes/UserGalleryPage/UserGalleryHeader';

type Props = {
  userRef: UserGalleryLayoutFragment$key;
  queryRef: UserGalleryLayoutQueryFragment$key;
};

export const UserGalleryLayout = ({ userRef, queryRef }: Props) => {
  const query = useFragment(
    graphql`
      fragment UserGalleryLayoutQueryFragment on Query {
        ...UserGalleryCollectionsQueryFragment
      }
    `,
    queryRef
  );

  const user = useFragment(
    graphql`
      fragment UserGalleryLayoutFragment on GalleryUser {
        galleries {
          collections {
            __typename
          }

          ...UserGalleryCollectionsFragment
        }

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

  return (
    <StyledGalleryLayout>
      <UserGalleryHeader
        userRef={user}
        showMobileLayoutToggle={showMobileLayoutToggle}
        mobileLayout={mobileLayout}
        setMobileLayout={setMobileLayout}
      />
      <VStack gap={32} align="center" justify="center" grow>
        {collectionsView}
      </VStack>
    </StyledGalleryLayout>
  );
};

export const StyledGalleryLayout = styled(VStack)`
  width: 100%;
  max-width: 1200px;
  padding: 16px 0 32px;

  @media only screen and ${breakpoints.tablet} {
    padding: 32px 0 32px;
  }
`;
