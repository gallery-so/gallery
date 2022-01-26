import {
  DEFAULT_COLUMNS,
  LAYOUT_GAP_BREAKPOINTS,
  MAX_COLUMNS,
  MIN_COLUMNS,
} from 'constants/layout';
import styled from 'styled-components';
import unescape from 'lodash.unescape';
import colors from 'components/core/colors';
import NftPreview from 'components/NftPreview/NftPreview';
import { TitleSerif, BodyRegular } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import breakpoints from 'components/core/breakpoints';
import { Collection } from 'types/Collection';
import { useMemo } from 'react';
import Markdown from 'components/core/Markdown/Markdown';
import { DisplayLayout } from 'components/core/enums';

type Props = {
  collection: Collection;
  mobileLayout: DisplayLayout;
};

export function isValidColumns(columns: number) {
  return columns >= MIN_COLUMNS && columns <= MAX_COLUMNS;
}

function UserGalleryCollection({ collection, mobileLayout }: Props) {
  const unescapedCollectionName = useMemo(() => unescape(collection.name), [collection.name]);
  const unescapedCollectorsNote = useMemo(
    () => unescape(collection.collectors_note),
    [collection.collectors_note]
  );
  const columns = useMemo(() => {
    if (collection?.layout?.columns && isValidColumns(collection.layout.columns)) {
      return collection.layout.columns;
    }

    return DEFAULT_COLUMNS;
  }, [collection.layout]);

  return (
    <StyledCollectionWrapper>
      <StyledCollectionHeader>
        <TitleSerif>{unescapedCollectionName}</TitleSerif>
        {unescapedCollectorsNote && (
          <>
            <Spacer height={8} />
            <StyledCollectorsNote color={colors.gray50}>
              <Markdown text={unescapedCollectorsNote} />
            </StyledCollectorsNote>
          </>
        )}
      </StyledCollectionHeader>
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
    </StyledCollectionWrapper>
  );
}

const StyledCollectionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledCollectionHeader = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  // to appear above content underneath
  z-index: 1;
  margin-bottom: 16px;

  @media only screen and ${breakpoints.mobileLarge} {
    width: 70%;
  }

  @media only screen and ${breakpoints.tablet} {
    width: 70%;
  }
`;

const StyledCollectorsNote = styled(BodyRegular)`
  /* ensures linebreaks are reflected in UI */
  white-space: pre-line;
`;

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

export default UserGalleryCollection;
