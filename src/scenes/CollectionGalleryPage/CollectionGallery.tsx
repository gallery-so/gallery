import { contentSize } from 'components/core/breakpoints';
import styled from 'styled-components';
import Spacer from 'components/core/Spacer/Spacer';
import NotFound from 'scenes/NotFound/NotFound';
import CollectionGalleryHeader from './CollectionGalleryHeader';
import useCollectionById from 'hooks/api/collections/useCollectionById';
import NftGallery from 'components/NftGallery/NftGallery';
import { DisplayLayout } from 'components/core/enums';

type Props = {
  collectionId?: string;
};

function CollectionGallery({ collectionId }: Props) {
  const collection = useCollectionById(collectionId ?? '') ?? null;

  if (!collection) {
    return <NotFound />;
  }

  return (
    <StyledCollectionGallery>
      <CollectionGalleryHeader collection={collection} />
      <Spacer height={80} />
      {/* TODO: Confirm if we need to add grid/list view too */}
      <NftGallery collection={collection} mobileLayout={DisplayLayout.GRID} />
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

export default CollectionGallery;
