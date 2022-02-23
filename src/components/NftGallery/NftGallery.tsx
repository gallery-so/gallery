import { DEFAULT_COLUMNS } from 'constants/layout';
import breakpoints from 'components/core/breakpoints';
import { DisplayLayout } from 'components/core/enums';
import NftPreview from 'components/NftPreview/NftPreview';
import { useMemo } from 'react';
import { isValidColumns } from 'scenes/UserGalleryPage/UserGalleryCollection';
import styled from 'styled-components';
import { Collection } from 'types/Collection';
import { Nft } from 'types/Nft';
import { generate12DigitId } from 'utils/collectionLayout';

type Props = {
  collection: Collection;
  mobileLayout: DisplayLayout;
};

function insertWhitespaceBlocks(nfts: Array<Nft | null>, whitespaceList: number[]) {
  const result = [...nfts];
  // Insert whitespace blocks into the list of items to stage according to the saved whitespace indexes.
  // Offset the index to insert at by the number of whitespaces already added
  whitespaceList.forEach((index, offset) => result.splice(index + offset, 0, null));

  return result;
}

function NftGallery({ collection, mobileLayout }: Props) {
  const columns = useMemo(() => {
    if (collection?.layout?.columns && isValidColumns(collection.layout.columns)) {
      return collection.layout.columns;
    }

    return DEFAULT_COLUMNS;
  }, [collection.layout]);

  const collectionWithWhitespace = useMemo(
    () => insertWhitespaceBlocks(collection.nfts, collection.layout?.whitespace ?? []),
    [collection.layout?.whitespace, collection.nfts]
  );

  const hideWhitespace = mobileLayout === DisplayLayout.LIST;
  const displayItems = useMemo(
    () => (hideWhitespace ? collection.nfts : collectionWithWhitespace),
    [collection.nfts, collectionWithWhitespace, hideWhitespace]
  );

  return (
    <StyledCollectionNfts columns={columns} mobileLayout={mobileLayout}>
      {displayItems.map((item) =>
        item === null ? (
          <div key={`blank-${generate12DigitId()}`} />
        ) : (
          <NftPreview key={item.id} nft={item} collectionId={collection.id} columns={columns} />
        )
      )}
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
