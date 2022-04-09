import { useMemo } from 'react';
import styled from 'styled-components';
import unescape from 'utils/unescape';
import { BaseM } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import colors from 'components/core/colors';
import { graphqlGetResizedNftImageUrlWithFallback } from 'utils/nft';
import Markdown from 'components/core/Markdown/Markdown';
import Settings from 'public/icons/ellipses.svg';
import { graphql, readInlineData, useFragment } from 'react-relay';
import { CollectionRowFragment$key } from '__generated__/CollectionRowFragment.graphql';
import { removeNullValues } from 'utils/removeNullValues';
import { CollectionRowCompactNftsFragment$key } from '__generated__/CollectionRowCompactNftsFragment.graphql';
import { CollectionRowGetVideoOrImageUrlFragment$key } from '__generated__/CollectionRowGetVideoOrImageUrlFragment.graphql';

type Props = {
  collectionRef: CollectionRowFragment$key;
  className?: string;
};

const BIG_NFT_SIZE_PX = 160;
const SMOL_NFT_SIZE_PX = 25;

function getVideoOrImageUrlForNft(
  nftRef: CollectionRowGetVideoOrImageUrlFragment$key
): { type: 'video'; url: string } | { type: 'image'; url: string } | undefined {
  const { media } = readInlineData(
    graphql`
      fragment CollectionRowGetVideoOrImageUrlFragment on Nft @inline {
        media {
          ... on VideoMedia {
            __typename
            contentRenderURLs {
              medium
            }
          }

          ... on AudioMedia {
            __typename
            contentRenderURL
          }

          ... on GltfMedia {
            __typename
            contentRenderURL
          }

          ... on HtmlMedia {
            __typename
            contentRenderURL
          }

          ... on ImageMedia {
            __typename
            contentRenderURLs {
              medium
            }
          }

          ... on InvalidMedia {
            __typename
            contentRenderURL
          }

          ... on JsonMedia {
            __typename
            contentRenderURL
          }

          ... on TextMedia {
            __typename
            contentRenderURL
          }

          ... on UnknownMedia {
            __typename
            contentRenderURL
          }
        }
      }
    `,
    nftRef
  );

  if (!media) {
    return undefined;
  }

  if (media.__typename === 'VideoMedia') {
    if (media.contentRenderURLs?.medium) {
      return { type: 'video', url: media.contentRenderURLs.medium };
    }
  } else if ('contentRenderURLs' in media && media.contentRenderURLs?.medium) {
    return { type: 'image', url: media?.contentRenderURLs?.medium };
  } else if ('contentRenderURL' in media && media.contentRenderURL) {
    return { type: 'image', url: media.contentRenderURL };
  }

  return undefined;
}

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

        nfts {
          id
          nft @required(action: NONE) {
            ...CollectionRowGetVideoOrImageUrlFragment
            ...CollectionRowCompactNftsFragment
          }
        }
      }
    `,
    collectionRef
  );

  const { name, collectorsNote, hidden } = collection;
  const nfts = useMemo(() => removeNullValues(collection.nfts), [collection]);

  const unescapedCollectionName = useMemo(() => unescape(name ?? ''), [name]);
  const unescapedCollectorsNote = useMemo(() => unescape(collectorsNote ?? ''), [collectorsNote]);

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
          <BaseM>{unescapedCollectionName}</BaseM>
          <Spacer height={4} />
          <StyledBaseM>
            <Markdown text={truncatedCollectorsNote} />
          </StyledBaseM>
        </TextContainer>
        <Settings />
      </Header>
      <Spacer height={12} />
      <Body>
        {firstThreeNfts.map((nft) => {
          const result = getVideoOrImageUrlForNft(nft.nft);

          if (!result) {
            return null;
          }

          const imageUrl = graphqlGetResizedNftImageUrlWithFallback(result.url, SMOL_NFT_SIZE_PX);

          return (
            <BigNftContainer key={nft.id}>
              {result.type === 'video' ? (
                <BigNftVideoPreview src={imageUrl} />
              ) : (
                <BigNftImagePreview src={imageUrl} />
              )}
            </BigNftContainer>
          );
        })}
        {remainingNfts.length > 0 ? (
          <CompactNfts nftRefs={remainingNfts.map((it) => it.nft)} />
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
  padding: 32px;

  border: 1px solid ${colors.metal};
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
`;

const StyledHiddenLabel = styled(BaseM)`
  text-align: right;
`;

const BigNftContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  width: ${BIG_NFT_SIZE_PX}px;
  height: ${BIG_NFT_SIZE_PX}px;
`;

const BigNftVideoPreview = styled.video`
  max-width: 100%;
  max-height: 100%;
`;

const BigNftImagePreview = styled.img`
  max-width: 100%;
  max-height: 100%;
`;

const Body = styled.div`
  display: flex;

  // Safari doesn't support this yet
  // column-gap: 24px;

  // Temporary solution until Safari support
  width: calc(100% + 24px);
  margin-left: -12px;
  ${BigNftContainer} {
    margin: 12px;
  }
`;

/**
 * Displays NFTs in mini tiles using the following logic:
 * - if 5 or less NFTs, display them all in a row
 * - if more than 5 NFTs, display the first 3, then the rest in text
 */
function CompactNfts({ nftRefs }: { nftRefs: CollectionRowCompactNftsFragment$key }) {
  const nfts = useFragment(
    graphql`
      fragment CollectionRowCompactNftsFragment on Nft @relay(plural: true) {
        id
        ...CollectionRowGetVideoOrImageUrlFragment
      }
    `,
    nftRefs
  );

  const nonNullNfts = removeNullValues(nfts);

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
            {firstThreeNfts.map((nft) => {
              const result = getVideoOrImageUrlForNft(nft);

              if (!result) {
                return null;
              }

              const imageUrl = graphqlGetResizedNftImageUrlWithFallback(
                result.url,
                SMOL_NFT_SIZE_PX
              );

              return (
                <SmolNftContainer key={nft.id}>
                  {result.type === 'video' ? (
                    <SmolNftVideoPreview src={imageUrl} />
                  ) : (
                    <SmolNftImagePreview src={imageUrl} />
                  )}
                </SmolNftContainer>
              );
            })}
            <Spacer width={2} />
            <BaseM>+{overflowCountText} more</BaseM>
          </NftsWithMoreText>
        ) : (
          firstFiveNfts.map((nft) => {
            const result = getVideoOrImageUrlForNft(nft);

            if (!result) {
              return null;
            }

            const imageUrl = graphqlGetResizedNftImageUrlWithFallback(result.url, SMOL_NFT_SIZE_PX);

            return (
              <SmolNftContainer key={nft.id}>
                {result.type === 'video' ? (
                  <SmolNftVideoPreview src={imageUrl} />
                ) : (
                  <SmolNftImagePreview src={imageUrl} />
                )}
              </SmolNftContainer>
            );
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

const SmolNftContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  width: ${SMOL_NFT_SIZE_PX}px;
  height: ${SMOL_NFT_SIZE_PX}px;
`;

const SmolNftVideoPreview = styled.video`
  max-width: 100%;
  max-height: 100%;
`;

const SmolNftImagePreview = styled.img`
  max-width: 100%;
  max-height: 100%;
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

export default CollectionRow;
