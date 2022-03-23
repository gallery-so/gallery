import { contentSize } from 'components/core/breakpoints';
import styled from 'styled-components';
import Spacer from 'components/core/Spacer/Spacer';
import NotFound from 'scenes/NotFound/NotFound';
import CollectionGalleryHeader from './CollectionGalleryHeader';
import useCollectionById from 'hooks/api/collections/useCollectionById';
import NftGallery from 'components/NftGallery/NftGallery';
import useMobileLayout from 'hooks/useMobileLayout';
import { graphql, useFragment } from 'react-relay';
import { CollectionGalleryFragment$key } from '__generated__/CollectionGalleryFragment.graphql';

type Props = {
  queryRef: CollectionGalleryFragment$key;
};

function CollectionGallery({ queryRef }: Props) {
  const { mobileLayout, setMobileLayout } = useMobileLayout();

  const { collection } = useFragment(
    graphql`
      fragment CollectionGalleryFragment on Query {
        collection: collectionById(id: $collectionId) {
          ...NftGalleryFragment
          ...CollectionGalleryHeaderFragment
        }
      }
    `,
    queryRef
  );

  if (!collection) {
    return <NotFound />;
  }

  return (
    <StyledCollectionGallery>
      <Spacer height={32} />
      <CollectionGalleryHeader
        collectionRef={collection}
        mobileLayout={mobileLayout}
        setMobileLayout={setMobileLayout}
      />
      <Spacer height={32} />
      <NftGalleryWrapper>
        <NftGallery collectionRef={collection} mobileLayout={mobileLayout} />
      </NftGalleryWrapper>
      <Spacer height={64} />
    </StyledCollectionGallery>
  );
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
