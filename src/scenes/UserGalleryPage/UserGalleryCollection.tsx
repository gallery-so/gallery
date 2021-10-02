import styled from 'styled-components';
import unescape from 'lodash.unescape';
import colors from 'components/core/colors';
import NftPreview from 'components/NftPreview/NftPreview';
import { TitleSerif, BodyRegular } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import breakpoints from 'components/core/breakpoints';
import { Collection } from 'types/Collection';
import { useMemo } from 'react';

type Props = {
  collection: Collection;
};

// Space between NFTs in pixels
const GAP_PX = 40;

function UserGalleryCollection({ collection }: Props) {
  const unescapedCollectionName = useMemo(() => unescape(collection.name), [collection.name]);
  const unescapedCollectorsNote = useMemo(() => unescape(collection.collectors_note), [collection.collectors_note]);

  return (
    <StyledCollectionWrapper>
      <StyledCollectionHeader>
        <TitleSerif>{unescapedCollectionName}</TitleSerif>
        {unescapedCollectorsNote
          && <>
            <Spacer height={8} />
            <StyledCollectorsNote color={colors.gray50}>
              {unescapedCollectorsNote}
            </StyledCollectorsNote>
          </>
        }
      </StyledCollectionHeader>
      <StyledCollectionNfts>
        {collection.nfts.map(nft => (
          <NftPreview
            key={nft.id}
            nft={nft}
            collectionId={collection.id}
            gap={GAP_PX}
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
  margin-bottom: -26px;

  @media only screen and ${breakpoints.tablet} {
    width: 70%;
  }
`;

const StyledCollectorsNote = styled(BodyRegular)`
  /* ensures linebreaks are reflected in UI */
  white-space: pre-wrap;
`;

const StyledCollectionNfts = styled.div`
  margin: 10px 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;

  // Can't use these for now due to lack of Safari support
  // column-gap: ${GAP_PX}px;
  // row-gap: ${GAP_PX}px;

  @media only screen and ${breakpoints.mobileLarge} {
    width: calc(100% + ${GAP_PX}px);
    margin-left: -${GAP_PX / 2}px;
  }

  @media only screen and ${breakpoints.desktop} {
    width: calc(100% + ${GAP_PX * 2}px);
    margin-left: -${GAP_PX}px;
  }
`;

export default UserGalleryCollection;
