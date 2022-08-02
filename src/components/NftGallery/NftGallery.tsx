import breakpoints from 'components/core/breakpoints';
import { DisplayLayout } from 'components/core/enums';
import { useMemo } from 'react';
import styled from 'styled-components';
import { insertWhitespaceBlocks } from 'utils/collectionLayout';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { NftGalleryFragment$key } from '__generated__/NftGalleryFragment.graphql';
// import { useCollectionColumns } from 'hooks/useCollectionColumns';
import { removeNullValues } from 'utils/removeNullValues';
import { parseCollectionLayout } from 'utils/collectionLayout';
import NftPreviewWrapper from 'components/NftPreview/GalleryNftPreviewWrapper';

type Props = {
  collectionRef: NftGalleryFragment$key;
  mobileLayout: DisplayLayout;
};

function NftGallery({ collectionRef, mobileLayout }: Props) {
  const collection = useFragment(
    graphql`
      fragment NftGalleryFragment on Collection {
        dbid
        layout {
          sections
          sectionLayout {
            columns
            whitespace
          }
        }
        tokens {
          id
          ...GalleryNftPreviewWrapperFragment
        }
      }
    `,
    collectionRef
  );

  // const columns = useCollectionColumns(collection);

  const hideWhitespace = mobileLayout === DisplayLayout.LIST;
  const nonNullWhitespace = removeNullValues(collection.layout?.sectionLayout?.whitespace);

  const collectionWithWhitespace = useMemo(
    () => insertWhitespaceBlocks(collection.tokens ?? [], nonNullWhitespace),
    [collection.tokens, nonNullWhitespace]
  );

  const itemsToDisplay = useMemo(
    () => (hideWhitespace ? collection.tokens : collectionWithWhitespace),
    [collection.tokens, collectionWithWhitespace, hideWhitespace]
  );

  const parsedCollection = useMemo(() => {
    // TODO handle empty collection
    return parseCollectionLayout(collection.tokens, collection.layout);
  }, [collection.layout, collection.tokens]);

  return (
    <StyledCollectionTokens>
      {Object.keys(parsedCollection).map((sectionId) => {
        const section = parsedCollection[sectionId];
        return (
          <StyledSection
            key={sectionId}
            columns={section.columns}
            mobileLayout={mobileLayout}
            // we used this option for figure31's gallery. in the future, if we want
            // to enable 10-column grids for any user, we can enable this
            reducedGridGap={false}
          >
            {section.items?.map((galleryNft) => {
              if (!galleryNft) {
                return;
              }

              if ('whitespace' in galleryNft) {
                return <StyledWhitespaceBlock key={galleryNft.id} />;
              }

              return <NftPreviewWrapper key={galleryNft.id} galleryNftRef={galleryNft} />;
            })}
          </StyledSection>
        );
      })}
    </StyledCollectionTokens>
  );
}

// grid-template-columns: ${({ columns, mobileLayout }) =>
//   mobileLayout === DisplayLayout.LIST ? '1fr' : `repeat(${columns},  minmax(auto, 100%))`};
const StyledCollectionTokens = styled.div`
  display: grid;
  grid-gap: 10px 0px;

  @media only screen and ${breakpoints.tablet} {
    grid-gap: 20px 0px;
  }

  @media only screen and ${breakpoints.desktop} {
    grid-gap: 40px 0px;
  }
`;

const StyledSection = styled.div<{
  columns: number;
  mobileLayout: DisplayLayout;
  reducedGridGap: boolean;
}>`
  display: grid;
  grid-template-columns: ${({ columns, mobileLayout }) =>
    mobileLayout === DisplayLayout.LIST ? '1fr' : `repeat(${columns},  minmax(auto, 100%))`};
  grid-gap: ${({ reducedGridGap }) => (reducedGridGap ? '5px 5px' : '10px 10px')};
  align-items: center;
  justify-content: center;

  @media only screen and ${breakpoints.tablet} {
    grid-gap: ${({ reducedGridGap }) => (reducedGridGap ? '5px 5px' : '20px 20px')};
  }

  @media only screen and ${breakpoints.desktop} {
    grid-gap: ${({ reducedGridGap }) => (reducedGridGap ? '5px 5px' : '40px 40px')};
  }
`;

const StyledWhitespaceBlock = styled.div`
  width: 100%;
  display: flex;
  padding-bottom: 100%;
`;

export default NftGallery;
