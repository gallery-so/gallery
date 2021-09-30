import { useMemo } from 'react';
import styled from 'styled-components';
import unescape from 'lodash.unescape';
import { BodyRegular, Caption } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import colors from 'components/core/colors';
import { Nft } from 'types/Nft';
import { getResizedNftImageUrlWithFallback } from 'utils/nft';
import { Collection } from 'types/Collection';
import { ReactComponent as Settings } from './collection-settings.svg';

type Props = {
  collection: Collection;
  className?: string;
};

const BIG_NFT_SIZE_PX = 160;
const SMOL_NFT_SIZE_PX = 25;

/**
 * Displays the first 3 NFTs in large tiles, while the rest are squeezed into the 4th position
 */
function CollectionRow({ collection, className }: Props) {
  const { name, collectors_note, nfts, hidden } = collection;

  const unescapedCollectorsNote = useMemo(() => unescape(collectors_note), [collectors_note]);

  const firstThreeNfts = useMemo(() => nfts.slice(0, 3), [nfts]);
  const remainingNfts = useMemo(() => nfts.slice(3), [nfts]);

  const isHidden = useMemo(() => Boolean(hidden), [hidden]);

  const truncatedCollectorsNote = useMemo(() => {
    const lines = unescapedCollectorsNote.split('\n');
    const firstLine = lines[0];

    // If it's multiline, always truncate to suggest there are more lines
    if (lines.length > 1) {
      return `${firstLine.slice(0, 97).trim()}...`;
    }

    // If it's single line, only truncate if it's longer than 100ch
    return firstLine.length > 100 ? `${firstLine.slice(0, 97).trim()}...` : firstLine;
  }, [unescapedCollectorsNote]);

  return (
    <StyledCollectionRow className={className} isHidden={isHidden}>
      <Header>
        <TextContainer>
          <BodyRegular>{name}</BodyRegular>
          <Spacer height={4} />
          <Caption color={colors.gray50}>{truncatedCollectorsNote}</Caption>
        </TextContainer>
        <Settings />
      </Header>
      <Spacer height={12} />
      <Body>
        {firstThreeNfts.map(nft => {
          const imageUrl = getResizedNftImageUrlWithFallback(
            nft,
            BIG_NFT_SIZE_PX,
          );
          return <BigNftPreview src={imageUrl} />;
        })}
        {remainingNfts.length > 0 ? <CompactNfts nfts={remainingNfts} /> : null}
      </Body>
      {isHidden && <StyledHiddenLabel caps>Hidden</StyledHiddenLabel>}
    </StyledCollectionRow>
  );
}

type StyledCollectionRowProps = {
  isHidden?: boolean;
};

const StyledCollectionRow = styled.div<StyledCollectionRowProps>`
  display: flex;
  flex-direction: column;

  width: 100%;
  padding: 32px;

  border: 1px solid ${colors.gray50};
  background-color: ${colors.white};

  opacity: ${({ isHidden }) => (isHidden ? '0.4' : '1')};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledHiddenLabel = styled(BodyRegular)`
  text-align: right;
`;

const BigNftPreview = styled.img`
  width: ${BIG_NFT_SIZE_PX}px;
  height: ${BIG_NFT_SIZE_PX}px;
`;

const Body = styled.div`
  display: flex;

  // Safari doesn't support this yet
  // column-gap: 24px;

  // Temporary solution until Safari support
  width: calc(100% + 24px);
  margin-left: -12px;
  ${BigNftPreview} {
    margin: 12px;
  }
`;

/**
 * Displays NFTs in mini tiles using the following logic:
 * - if 5 or less NFTs, display them all in a row
 * - if more than 5 NFTs, display the first 3, then the rest in text
 */
function CompactNfts({ nfts }: { nfts: Nft[] }) {
  const firstThreeNfts = useMemo(() => nfts.slice(0, 3), [nfts]);
  const firstFiveNfts = useMemo(() => nfts.slice(0, 5), [nfts]);
  const remainingNfts = useMemo(() => nfts.slice(5), [nfts]);

  // Account for the fact that having more than 5 NFTs will result in
  // only 3 tiles being displayed before the text
  const overflowCountText = remainingNfts.length + 2;

  const hasMoreThanFiveNfts = remainingNfts.length > 0;

  return (
    <StyledCompactNfts>
      <Content>
        {hasMoreThanFiveNfts ? (
          <NftsWithMoreText>
            {firstThreeNfts.map(nft => {
              const imageUrl = getResizedNftImageUrlWithFallback(
                nft,
                SMOL_NFT_SIZE_PX,
              );
              return <SmolNftPreview src={imageUrl} />;
            })}
            <Spacer width={2} />
            <BodyRegular>+{overflowCountText} more</BodyRegular>
          </NftsWithMoreText>
        ) : (
          firstFiveNfts.map(nft => {
            const imageUrl = getResizedNftImageUrlWithFallback(
              nft,
              SMOL_NFT_SIZE_PX,
            );
            return nft ? <SmolNftPreview src={imageUrl} /> : null;
          })
        )}
      </Content>
    </StyledCompactNfts>
  );
}

const StyledCompactNfts = styled.div`
  width: ${BIG_NFT_SIZE_PX}px;
  height: ${BIG_NFT_SIZE_PX}px;
  margin: 12px;

  display: flex;
  justify-content: center;
  align-items: center;
`;

const SmolNftPreview = styled.img`
  width: ${SMOL_NFT_SIZE_PX}px;
  height: ${SMOL_NFT_SIZE_PX}px;
`;

const Content = styled.div`
  width: 141px;

  display: flex;

  // Safari doesn't support this yet
  // column-gap: 4px;

  // Temporary solution until Safari support
  margin-left: -2px;
  ${SmolNftPreview} {
    margin: 2px;
  }
`;

const NftsWithMoreText = styled.div`
  display: flex;
  align-items: center;
  column-gap: 4px;

  white-space: nowrap;
`;

export default CollectionRow;
