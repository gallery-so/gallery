import styled from 'styled-components';
import unescape from 'lodash.unescape';
import colors from 'components/core/colors';
import NftPreview, { LAYOUT_GAP_BREAKPOINTS } from 'components/NftPreview/NftPreview';
import { TitleSerif, BodyRegular } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import breakpoints from 'components/core/breakpoints';
import { Collection } from 'types/Collection';
import { useMemo } from 'react';
import Markdown from 'components/core/Markdown/Markdown';

type Props = {
  collection: Collection;
};

function UserGalleryCollection({ collection }: Props) {
  const unescapedCollectionName = useMemo(() => unescape(collection.name), [collection.name]);
  const unescapedCollectorsNote = useMemo(() => unescape(collection.collectors_note), [collection.collectors_note]);

  const columns = useMemo(() => (collection?.layout?.columns ?? 3), [collection.layout]);

  return (<StyledCollectionWrapper>
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
    <StyledCollectionNfts columns={columns}>
      {collection.nfts.map(nft => (
        <NftPreview
          key={nft.id}
          nft={nft}
          collectionId={collection.id}
          columns={columns}
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

const StyledCollectionNfts = styled.div<{ columns: number }>`
  margin: 10px 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: ${({ columns }) => columns === 1 ? 'center' : 'initial'};

  // Can't use these for now due to lack of Safari support
  // column-gap: px;
  // row-gap: px;


  @media only screen and ${breakpoints.mobileLarge} {
    margin-left: -${LAYOUT_GAP_BREAKPOINTS.mobileLarge / 2}px;
  }

  @media only screen and ${breakpoints.desktop} {
    margin-left: -${LAYOUT_GAP_BREAKPOINTS.desktop / 2}px;
  }
`;

export default UserGalleryCollection;
