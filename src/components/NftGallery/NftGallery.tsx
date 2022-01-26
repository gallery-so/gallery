import { DEFAULT_COLUMNS, LAYOUT_GAP_BREAKPOINTS } from 'constants/layout';
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
        <NftPreview
          key={nft.id}
          nft={nft}
          collectionId={collection.id}
          columns={columns}
          mobileLayout={mobileLayout}
        />
      ))}
    </StyledCollectionNfts>
  );
}

const StyledCollectionNfts = styled.div<{ columns: number; mobileLayout: DisplayLayout }>`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: ${({ columns }) => (columns === 1 ? 'center' : 'initial')};

  // Can't use these for now due to lack of Safari support
  // column-gap: px;
  // row-gap: px;
  margin-left: ${({ mobileLayout }) =>
    mobileLayout === DisplayLayout.GRID ? `-${LAYOUT_GAP_BREAKPOINTS.mobileSmall / 2}px` : '0px'};

  @media only screen and ${breakpoints.mobileLarge} {
    margin-left: -${LAYOUT_GAP_BREAKPOINTS.mobileLarge / 2}px;
  }

  @media only screen and ${breakpoints.desktop} {
    margin-left: -${LAYOUT_GAP_BREAKPOINTS.desktop / 2}px;
  }
`;

export default NftGallery;
