import styled from 'styled-components';
import NotFound from 'scenes/NotFound/NotFound';
import CollectionGalleryHeader from './CollectionGalleryHeader';
import NftGallery from 'components/NftGallery/NftGallery';
import useMobileLayout from 'hooks/useMobileLayout';
import { graphql, useFragment } from 'react-relay';
import { CollectionGalleryFragment$key } from '__generated__/CollectionGalleryFragment.graphql';
import { useIsMobileWindowWidth } from 'hooks/useWindowSize';
import { VStack } from 'components/core/Spacer/Stack';

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

            gallery {
              owner {
                username
                ...NavActionFollowUserFragment
              }
            }

            ...NftGalleryFragment
            ...CollectionGalleryHeaderFragment
          }
        }
        ...NavActionFollowQueryFragment
        ...CollectionGalleryHeaderQueryFragment
      }
    `,
    queryRef
  );

  const { collection } = query;
  const isMobile = useIsMobileWindowWidth();

  if (collection?.__typename === 'Collection') {
    return (
      <StyledCollectionGallery isMobile={isMobile} align="center">
        <NftGalleryWrapper gap={isMobile ? 12 : 80}>
          <CollectionGalleryHeader
            queryRef={query}
            collectionRef={collection}
            mobileLayout={mobileLayout}
            setMobileLayout={setMobileLayout}
          />
          <NftGallery collectionRef={collection} mobileLayout={mobileLayout} />
        </NftGalleryWrapper>
      </StyledCollectionGallery>
    );
  } else if (collection?.__typename === 'ErrCollectionNotFound') {
    return <NotFound resource="collection" />;
  }

  // TODO: just throw to an error boundary and have that report to sentry
  return null;
}

const StyledCollectionGallery = styled(VStack)<{ isMobile: boolean }>`
  width: 100%;
  max-width: 1200px;
  padding: ${({ isMobile }) => (isMobile ? '8px 0 16px 0' : '80px 0 64px 0')};
`;

const NftGalleryWrapper = styled(VStack)`
  width: 100%;
`;

export default CollectionGallery;
