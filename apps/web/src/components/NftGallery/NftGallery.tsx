import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { DisplayLayout } from '~/components/core/enums';
import NftPreviewWrapper from '~/components/NftPreview/GalleryNftPreviewWrapper';
import { NftGalleryFragment$key } from '~/generated/NftGalleryFragment.graphql';
import { NftGalleryQueryFragment$key } from '~/generated/NftGalleryQueryFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import { parseCollectionLayoutGraphql } from '~/shared/utils/collectionLayout';

type Props = {
  queryRef: NftGalleryQueryFragment$key;
  collectionRef: NftGalleryFragment$key;
  mobileLayout: DisplayLayout;
};

function NftGallery({ queryRef, collectionRef, mobileLayout }: Props) {
  const query = useFragment(
    graphql`
      fragment NftGalleryQueryFragment on Query {
        ...GalleryNftPreviewWrapperQueryFragment
      }
    `,
    queryRef
  );
  const collection = useFragment(
    graphql`
      fragment NftGalleryFragment on Collection {
        layout {
          ...collectionLayoutParseFragment
        }
        tokens {
          id
          ...GalleryNftPreviewWrapperFragment
        }
      }
    `,
    collectionRef
  );

  const hideWhitespace = mobileLayout === DisplayLayout.LIST;

  const parsedCollection = useMemo(() => {
    if (!collection.tokens || !collection.layout) {
      return [];
    }

    return parseCollectionLayoutGraphql(
      removeNullValues(collection.tokens),
      collection.layout,
      hideWhitespace
    );
  }, [collection.layout, collection.tokens, hideWhitespace]);

  return (
    <StyledCollectionTokens>
      {parsedCollection.map((section) => {
        return (
          <StyledSection
            key={section.id}
            columns={section.columns}
            mobileLayout={mobileLayout}
            // we used this option for figure31's gallery. in the future, if we want
            // to enable 10-column grids for any user, we can enable this
            reducedGridGap={false}
          >
            {section.items?.map((token) => {
              if (!token) {
                return;
              }

              if ('whitespace' in token) {
                return <StyledWhitespaceBlock key={token.id} />;
              }

              return (
                <NftPreviewWrapper
                  key={token.id}
                  queryRef={query}
                  tokenRef={token}
                  columns={section.columns}
                />
              );
            })}
          </StyledSection>
        );
      })}
    </StyledCollectionTokens>
  );
}

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
