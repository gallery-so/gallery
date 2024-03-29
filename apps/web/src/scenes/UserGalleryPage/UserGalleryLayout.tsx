import { useRouter } from 'next/router';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { VStack } from '~/components/core/Spacer/Stack';
import { UserGalleryLayoutFragment$key } from '~/generated/UserGalleryLayoutFragment.graphql';
import { UserGalleryLayoutQueryFragment$key } from '~/generated/UserGalleryLayoutQueryFragment.graphql';
import useMobileLayout from '~/hooks/useMobileLayout';
import { useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import EmptyGallery from '~/scenes/UserGalleryPage/EmptyGallery';
import GalleryNameDescriptionHeader from '~/scenes/UserGalleryPage/GalleryNameDescriptionHeader';
import UserGalleryCollections from '~/scenes/UserGalleryPage/UserGalleryCollections';

type Props = {
  galleryRef: UserGalleryLayoutFragment$key;
  queryRef: UserGalleryLayoutQueryFragment$key;
};

export const UserGalleryLayout = ({ galleryRef, queryRef }: Props) => {
  const query = useFragment(
    graphql`
      fragment UserGalleryLayoutQueryFragment on Query {
        ...UserGalleryCollectionsQueryFragment
      }
    `,
    queryRef
  );

  const gallery = useFragment(
    graphql`
      fragment UserGalleryLayoutFragment on Gallery {
        collections {
          __typename
        }

        ...GalleryNameDescriptionHeaderFragment
        ...UserGalleryCollectionsFragment
      }
    `,
    galleryRef
  );

  const isMobile = useIsMobileWindowWidth();
  const { pathname } = useRouter();
  const showMobileLayoutToggle = Boolean(isMobile && gallery.collections?.length);
  const { mobileLayout, setMobileLayout } = useMobileLayout();

  const collectionsView = gallery?.collections ? (
    <UserGalleryCollections queryRef={query} galleryRef={gallery} mobileLayout={mobileLayout} />
  ) : (
    <EmptyGallery message="This user has not set up their gallery yet." />
  );

  return (
    <VStack>
      <GalleryNameDescriptionHeader
        noLink={pathname === '/[username]/galleries/[galleryId]'}
        galleryRef={gallery}
        showMobileLayoutToggle={showMobileLayoutToggle}
        mobileLayout={mobileLayout}
        setMobileLayout={setMobileLayout}
      />
      <VStack gap={32} align="center" grow>
        {collectionsView}
      </VStack>
    </VStack>
  );
};
