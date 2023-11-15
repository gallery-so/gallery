import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { VStack } from '~/components/core/Spacer/Stack';
import NftGallery from '~/components/NftGallery/NftGallery';
import { CollectionGalleryFragment$key } from '~/generated/CollectionGalleryFragment.graphql';
import useMobileLayout from '~/hooks/useMobileLayout';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import NotFound from '~/scenes/NotFound/NotFound';

import CollectionGalleryHeader from './CollectionGalleryHeader';

type Props = {
  queryRef: CollectionGalleryFragment$key;
};

function CollectionGallery({ queryRef }: Props) {
  const { mobileLayout, setMobileLayout } = useMobileLayout();

  const query = useFragment(
    graphql`
      fragment CollectionGalleryFragment on Query {
        collection: collectionById(id: $collectionId) {
          ... on ErrCollectionNotFound {
            __typename
          }

          ... on Collection {
            __typename

            ...NftGalleryFragment
            ...CollectionGalleryHeaderFragment
          }
        }
        ...CollectionGalleryHeaderQueryFragment
      }
    `,
    queryRef
  );

  const { collection } = query;
  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  if (collection?.__typename === 'Collection') {
    return (
      <NftGalleryWrapper gap={isMobile ? 12 : 80}>
        <CollectionGalleryHeader
          queryRef={query}
          collectionRef={collection}
          mobileLayout={mobileLayout}
          setMobileLayout={setMobileLayout}
        />
        <NftGallery collectionRef={collection} mobileLayout={mobileLayout} />
      </NftGalleryWrapper>
    );
  } else if (collection?.__typename === 'ErrCollectionNotFound') {
    return <NotFound resource="section" />;
  }

  // TODO: just throw to an error boundary and have that report to sentry
  return null;
}

const NftGalleryWrapper = styled(VStack)`
  width: 100%;
`;

export default CollectionGallery;
