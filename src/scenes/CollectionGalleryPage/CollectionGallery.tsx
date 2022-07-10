import { contentSize } from 'components/core/breakpoints';
import styled from 'styled-components';
import Spacer from 'components/core/Spacer/Spacer';
import NotFound from 'scenes/NotFound/NotFound';
import CollectionGalleryHeader from './CollectionGalleryHeader';
import NftGallery from 'components/NftGallery/NftGallery';
import useMobileLayout from 'hooks/useMobileLayout';
import { graphql, useFragment } from 'react-relay';
import { CollectionGalleryFragment$key } from '__generated__/CollectionGalleryFragment.graphql';
import { useIsMobileWindowWidth } from 'hooks/useWindowSize';

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
  const isMobile = useIsMobileWindowWidth();

  if (collection?.__typename === 'Collection') {
    return (
      <StyledCollectionGallery>
        <Spacer height={isMobile ? 48 : 80} />
        <CollectionGalleryHeader
          queryRef={query}
          collectionRef={collection}
          mobileLayout={mobileLayout}
          setMobileLayout={setMobileLayout}
        />
        <NftGalleryWrapper>
          <NftGallery collectionRef={collection} mobileLayout={mobileLayout} />
        </NftGalleryWrapper>
        <Spacer height={isMobile ? 16 : 64} />
      </StyledCollectionGallery>
    );
  } else if (collection?.__typename === 'ErrCollectionNotFound') {
    return <NotFound resource="collection" />;
  }

  // TODO: just throw to an error boundary and have that report to sentry
  return null;
}

const StyledCollectionGallery = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;

  max-width: ${contentSize.desktop}px;
`;

const NftGalleryWrapper = styled.div`
  width: 100%;
`;

export default CollectionGallery;
