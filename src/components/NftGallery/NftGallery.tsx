import { DEFAULT_COLUMNS } from 'constants/layout';
import breakpoints from 'components/core/breakpoints';
import { DisplayLayout } from 'components/core/enums';
import NftPreview from 'components/NftPreview/NftPreview';
import { useMemo } from 'react';
import { isValidColumns } from 'scenes/UserGalleryPage/UserGalleryCollection';
import styled from 'styled-components';
import { Collection } from 'types/Collection';

type Props = {
  collection: Collection;
  mobileLayout: DisplayLayout;
};

function NftGallery({ collection, mobileLayout }: Props) {
  const columns = useMemo(() => {
    if (collection?.layout?.columns && isValidColumns(collection.layout.columns)) {
      return collection.layout.columns;
    }

    return DEFAULT_COLUMNS;
  }, [collection.layout]);

  return (
    <StyledCollectionNfts columns={columns} mobileLayout={mobileLayout}>
      {collection.nfts.map((nft) => (
        <NftPreview key={nft.id} nft={nft} collectionId={collection.id} columns={columns} />
      ))}
    </StyledCollectionNfts>
  );
}

const StyledCollectionNfts = styled.div<{ columns: number; mobileLayout: DisplayLayout }>`
  display: grid;
  grid-template-columns: ${({ columns, mobileLayout }) =>
    mobileLayout === DisplayLayout.LIST ? '1fr' : `repeat(${columns},  minmax(auto, 50%))`};
  grid-gap: 10px 10px;
  align-items: center;
  justify-content: center;

  @media only screen and ${breakpoints.tablet} {
    grid-gap: 20px 20px;
  }

  @media only screen and ${breakpoints.desktop} {
    grid-gap: 40px 40px;
  }
`;

export default NftGallery;
