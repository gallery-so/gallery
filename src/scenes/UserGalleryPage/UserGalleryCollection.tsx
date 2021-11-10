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

type Props = {
  collection: Collection;
};

// Space between NFTs in pixels
const GAP_PX = 40;

export const LAYOUT_DIMENSIONS: Record<number, any> = {
  1: { size: 600, gap: 40 },
  2: { size: 380, gap: 80 },
  3: { size: 288, gap: 40 },
  4: { size: 214, gap: 28 },
  5: { size: 160, gap: 28 },
  6: { size: 137, gap: 20 },
};

function UserGalleryCollection({ collection }: Props) {
  const unescapedCollectionName = useMemo(() => unescape(collection.name), [collection.name]);
  const unescapedCollectorsNote = useMemo(() => unescape(collection.collectors_note), [collection.collectors_note]);
  const columns = useMemo(() => collection.layout.columns, [collection.layout.columns]);

  return (
    <StyledCollectionWrapper>
      <StyledCollectionHeader>
        <TitleSerif>{unescapedCollectionName}</TitleSerif>
        {unescapedCollectorsNote
          && <>
            <Spacer height={8} />
            <StyledCollectorsNote color={colors.gray50}>
              <Markdown text={unescapedCollectorsNote} />
            </StyledCollectorsNote>
          </>
        }
      </StyledCollectionHeader>
      <StyledCollectionNfts gap={LAYOUT_DIMENSIONS[columns].gap} columns={columns}>
        <StyledTest>
          {collection.nfts.map(nft => (
            <NftPreview
              key={nft.id}
              nft={nft}
              collectionId={collection.id}
              gap={GAP_PX}
              columns={columns}
            />
          ))}
        </StyledTest>
      </StyledCollectionNfts>
    </StyledCollectionWrapper>
  );
}

const StyledTest = styled.div`
display: flex;
flex-wrap: wrap;
padding: 0 auto;
margin: 0 auto;
`;

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

  @media only screen and ${breakpoints.mobile} {
    margin-bottom: 20px;
  }

  @media only screen and ${breakpoints.mobileLarge} {
    margin-bottom: 0px;
    width: 70%;
  }
 
  @media only screen and ${breakpoints.tablet} {
    margin-bottom: 0px;
    width: 70%;
  }

  @media only screen and ${breakpoints.desktop} {
    margin-bottom: -20px;
  }  
`;

const StyledCollectorsNote = styled(BodyRegular)`
  /* ensures linebreaks are reflected in UI */
  white-space: pre-line;
`;

const StyledCollectionNfts = styled.div<{ gap: number; columns: number }>`
  margin: 10px 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: ${({ columns }) => columns < 3 ? 'center' : 'flex-start'};

  // Can't use these for now due to lack of Safari support
  // column-gap: ${GAP_PX}px;
  // row-gap: ${GAP_PX}px;

  @media only screen and ${breakpoints.mobileLarge} {
    width: calc(100% + ${({ gap }) => gap}px);
    margin-left: -${GAP_PX / 2}px;
  }

  @media only screen and ${breakpoints.desktop} {
    width: calc(100% + ${({ gap }) => gap * 2}px);
    margin-left: -${({ gap }) => gap}px;
  }
`;

export default UserGalleryCollection;
