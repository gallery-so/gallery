import { useMemo } from 'react';
import styled from 'styled-components';
import unescape from 'utils/unescape';
import { BaseM, TitleS } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import colors from 'components/core/colors';
import { graphql, useFragment } from 'react-relay';
import { CollectionRowFragment$key } from '__generated__/CollectionRowFragment.graphql';
import { removeNullValues } from 'utils/removeNullValues';
import { CollectionRowCompactNftsFragment$key } from '__generated__/CollectionRowCompactNftsFragment.graphql';
import Markdown from 'components/core/Markdown/Markdown';
import { useIsMobileOrMobileLargeWindowWidth } from 'hooks/useWindowSize';
import {
  BIG_NFT_SIZE_PX,
  BigNft,
  BigNftContainer,
} from 'flows/shared/steps/OrganizeGallery/BigNft';
import { SmolNft, SmolNftContainer } from 'flows/shared/steps/OrganizeGallery/SmolNft';

type Props = {
  className?: string;
  collectionRef: CollectionRowFragment$key;
};

/**
 * Displays the first 3 NFTs in large tiles, while the rest are squeezed into the 4th position
 */
function CollectionRow({ collectionRef, className }: Props) {
  const collection = useFragment(
    graphql`
      fragment CollectionRowFragment on Collection {
        name
        collectorsNote
        hidden

        tokens @required(action: THROW) {
          id @required(action: THROW)
          token @required(action: THROW) {
            ...BigNftFragment
            ...CollectionRowCompactNftsFragment
          }
        }
      }
    `,
    collectionRef
  );

  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  const { name, collectorsNote, hidden } = collection;
  const tokens = useMemo(() => removeNullValues(collection.tokens), [collection]);

  const unescapedCollectionName = useMemo(() => unescape(name ?? ''), [name]);
  const unescapedCollectorsNote = useMemo(() => unescape(collectorsNote ?? ''), [collectorsNote]);

  const firstThreeNfts = useMemo(() => tokens.slice(0, 3), [tokens]);
  const remainingNfts = useMemo(() => tokens.slice(3), [tokens]);

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
          <TitleS>
            {unescapedCollectionName.trim() ? (
              <>
                {unescapedCollectionName} <StyledBullet>&bull;</StyledBullet>{' '}
              </>
            ) : null}
            <NumberPiecesText>
              {tokens.length} {tokens.length === 1 ? 'piece' : 'pieces'}
            </NumberPiecesText>
          </TitleS>
          <StyledBaseM>
            <Markdown text={truncatedCollectorsNote} />
          </StyledBaseM>
        </TextContainer>
      </Header>
      <Spacer height={12} />
      <Body>
        {firstThreeNfts.map((token) => (
          <BigNft key={token.id} tokenRef={token.token} />
        ))}
        {remainingNfts.length > 0 && !isMobile ? (
          <CompactNfts nftRefs={remainingNfts.map((it) => it.token)} />
        ) : null}
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
  padding: 16px;

  border: 1px solid ${colors.porcelain};
  background-color: ${colors.white};

  opacity: ${({ isHidden }) => (isHidden ? '0.4' : '1')};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StyledBaseM = styled(BaseM)`
  /* ensures linebreaks are reflected in UI */
  white-space: pre-line;
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;

  max-width: calc(100% - 75px);
`;

const StyledHiddenLabel = styled(BaseM)`
  text-align: right;
`;

const Body = styled.div`
  display: flex;

  // Safari doesn't support this yet
  // column-gap: 24px;

  // Temporary solution until Safari support
  width: calc(100% + 24px);
  margin-left: -12px;
  ${BigNftContainer} {
    margin: 0 12px;
  }
`;

/**
 * Displays NFTs in mini tiles using the following logic:
 * - if 5 or less NFTs, display them all in a row
 * - if more than 5 NFTs, display the first 3, then the rest in text
 */
function CompactNfts({ nftRefs }: { nftRefs: CollectionRowCompactNftsFragment$key }) {
  const tokens = useFragment(
    graphql`
      fragment CollectionRowCompactNftsFragment on Token @relay(plural: true) {
        id
        contract {
          contractAddress {
            address
          }
        }
        ...getVideoOrImageUrlForNftPreviewFragment
        ...SmolNftFragment
      }
    `,
    nftRefs
  );

  const nonNullNfts = removeNullValues(tokens);

  const firstThreeNfts = useMemo(() => nonNullNfts.slice(0, 3), [nonNullNfts]);
  const firstFiveNfts = useMemo(() => nonNullNfts.slice(0, 5), [nonNullNfts]);
  const remainingNfts = useMemo(() => nonNullNfts.slice(5), [nonNullNfts]);

  // Account for the fact that having more than 5 NFTs will result in
  // only 3 tiles being displayed before the text
  const overflowCountText = remainingNfts.length + 2;

  const hasMoreThanFiveNfts = remainingNfts.length > 0;

  return (
    <StyledCompactNfts>
      <Content>
        {hasMoreThanFiveNfts ? (
          <NftsWithMoreText>
            {firstThreeNfts.map((token) => (
              <SmolNft key={token.id} tokenRef={token} />
            ))}
            <Spacer width={2} />
            <BaseM>+{overflowCountText} more</BaseM>
          </NftsWithMoreText>
        ) : (
          firstFiveNfts.map((token) => <SmolNft key={token.id} tokenRef={token} />)
        )}
      </Content>
    </StyledCompactNfts>
  );
}

const StyledCompactNfts = styled.div`
  width: ${BIG_NFT_SIZE_PX}px;
  height: ${BIG_NFT_SIZE_PX}px;
  margin: 0 12px;

  display: flex;
  justify-content: center;
  align-items: center;
`;

const Content = styled.div`
  width: 141px;

  display: flex;

  // Safari doesn't support this yet
  // column-gap: 4px;

  // Temporary solution until Safari support
  margin-left: -2px;
  ${SmolNftContainer} {
    margin: 2px;
  }
`;

const NftsWithMoreText = styled.div`
  display: flex;
  align-items: center;
  column-gap: 4px;

  white-space: nowrap;
`;

const StyledBullet = styled(BaseM)`
  display: inline;
  margin: 0 3px;
  font-weight: 100;
`;

const NumberPiecesText = styled(BaseM)`
  display: inline;
  font-weight: 400;
`;

export default CollectionRow;
