import { DEFAULT_COLUMNS } from 'constants/layout';
import breakpoints from 'components/core/breakpoints';
import { DisplayLayout } from 'components/core/enums';
import NftPreview from 'components/NftPreview/NftPreview';
import { useMemo } from 'react';
import { isValidColumns } from 'scenes/UserGalleryPage/UserGalleryCollection';
import styled from 'styled-components';
import { Collection } from 'types/Collection';
import { Nft } from 'types/Nft';
import { insertWhitespaceBlocks } from 'utils/collectionLayout';
import { WhitespaceBlock } from 'flows/shared/steps/OrganizeCollection/types';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { NftGalleryFragment$key } from '../../../__generated__/NftGalleryFragment.graphql';
import { useCollectionColumns } from 'hooks/useCollectionColumns';

type Props = {
  collectionRef: NftGalleryFragment$key;
  mobileLayout: DisplayLayout;
};

function isNft(item: Nft | WhitespaceBlock): item is Nft {
  return 'created_at' in item;
}

function NftGallery({ collectionRef, mobileLayout }: Props) {
  const collection = useFragment(
    graphql`
      fragment NftGalleryFragment on GalleryCollection {
        id
        layout {
          columns
        }
        nfts {
          id
          ...NftPreviewFragment
        }

        ...useCollectionColumnsFragment
      }
    `,
    collectionRef
  );

  const columns = useCollectionColumns(collection);

  const hideWhitespace = mobileLayout === DisplayLayout.LIST;

  // const collectionWithWhitespace = useMemo(
  //   () => insertWhitespaceBlocks(collection.nfts, collection.layout?.whitespace ?? []),
  //   [collection.layout?.whitespace, collection.nfts]
  // );
  // const itemsToDisplay = useMemo(
  //   () => (hideWhitespace ? collection.nfts : collectionWithWhitespace),
  //   [collection.nfts, collectionWithWhitespace, hideWhitespace]
  // );

  const itemsToDisplay = collection.nfts;

  return (
    <StyledCollectionNfts columns={columns} mobileLayout={mobileLayout}>
      {itemsToDisplay?.map(
        (galleryNft) => {
          if (!galleryNft) {
            return;
          }

          return (
            // isNft(galleryNft) ? (
            <NftPreview key={galleryNft.id} galleryNftRef={galleryNft} />
          );
        }
        // ) : (
        //   <StyledWhitespaceBlock key={item.id} />
        // )
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

const StyledWhitespaceBlock = styled.div`
  width: 100%;
  display: flex;
  padding-bottom: 100%;
`;

export default NftGallery;
