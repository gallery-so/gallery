import { captureException } from '@sentry/nextjs';
import breakpoints from 'components/core/breakpoints';
import { Directions } from 'components/core/enums';
import ShimmerProvider from 'contexts/shimmer/ShimmerContext';
import { useIsMobileOrMobileLargeWindowWidth } from 'hooks/useWindowSize';
import { useMemo, useCallback } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';
import { NftDetailViewFragment$key } from '__generated__/NftDetailViewFragment.graphql';
import NavigationHandle from './NavigationHandle';
import NftDetailAsset from './NftDetailAsset';
import NftDetailNote from './NftDetailNote';
import NftDetailText from './NftDetailText';
import useKeyDown from 'hooks/useKeyDown';
import { useRouter } from 'next/router';
import useBackButton from 'hooks/useBackButton';

type Props = {
  username: string;
  authenticatedUserOwnsAsset: boolean;
  queryRef: NftDetailViewFragment$key;
  nftId: string;
};

export default function NftDetailView({
  username,
  authenticatedUserOwnsAsset,
  queryRef,
  nftId,
}: Props) {
  const collectionNft = useFragment(
    graphql`
      fragment NftDetailViewFragment on CollectionNft {
        nft @required(action: THROW) {
          dbid
          name
          description
          contractAddress
          tokenId
          externalUrl
          collectorsNote
          creatorAddress
          openseaCollectionName
        }
        collection @required(action: THROW) {
          dbid
          nfts {
            nft {
              dbid
            }
          }
        }
        ...NftDetailAssetFragment
      }
    `,
    queryRef
  );

  const isMobileOrMobileLarge = useIsMobileOrMobileLargeWindowWidth();

  const collectionNfts = collectionNft.collection.nfts;

  const { prevNftId, nextNftId } = useMemo(() => {
    if (!collectionNfts) {
      captureException(`NFT collection not found for NFT ${nftId}`);
      return {
        prevNftId: null,
        nextNftId: null,
      };
    }

    const nftIndex = collectionNfts.findIndex(
      (collectionNft) => collectionNft?.nft?.dbid === nftId
    );

    if (nftIndex === -1) {
      captureException(`NFT not found in collection for NFT ${nftId}`);
      return {
        prevNftId: null,
        nextNftId: null,
      };
    }

    return {
      prevNftId: collectionNfts[nftIndex - 1]?.nft?.dbid ?? null,
      nextNftId: collectionNfts[nftIndex + 1]?.nft?.dbid ?? null,
    };
  }, [collectionNfts, nftId]);

  const { nft, collection } = collectionNft;

  const handleBackClick = useBackButton({ username });
  const { replace } = useRouter();

  const navigateToId = useCallback(
    (nftId: string) => {
      void replace(`/${username}/${collection.dbid}/${nftId}`);
    },
    [username, collection.dbid, replace]
  );

  // Unsure why, but setTimeout is needed, otherwise next/prevNftId will be null sometimes
  const handleNextPress = useCallback(() => {
    setTimeout(() => {
      if (nextNftId) navigateToId(nextNftId);
    }, 0);
  }, [nextNftId, navigateToId]);

  const handlePrevPress = useCallback(() => {
    setTimeout(() => {
      if (prevNftId) navigateToId(prevNftId);
    }, 0);
  }, [prevNftId, navigateToId]);

  useKeyDown('ArrowRight', handleNextPress);
  useKeyDown('ArrowLeft', handlePrevPress);
  useKeyDown('Escape', handleBackClick);
  useKeyDown('Backspace', handleBackClick);

  const assetHasNote = !!nft.collectorsNote;
  const showCollectorsNoteComponent = assetHasNote || authenticatedUserOwnsAsset;

  const leftArrow = prevNftId && (
    <NavigationHandle
      direction={Directions.LEFT}
      username={username}
      collectionId={collection.dbid}
      nftId={prevNftId}
    />
  );

  const rightArrow = nextNftId && (
    <NavigationHandle
      direction={Directions.RIGHT}
      username={username}
      collectionId={collection.dbid}
      nftId={nextNftId}
    />
  );
  return (
    <StyledBody>
      {!isMobileOrMobileLarge && <StyledNavigationBuffer />}
      {leftArrow}
      <StyledContentContainer>
        <StyledAssetAndNoteContainer>
          <ShimmerProvider>
            <NftDetailAsset
              nftRef={collectionNft}
              hasExtraPaddingForNote={showCollectorsNoteComponent}
            />
          </ShimmerProvider>
          {showCollectorsNoteComponent && (
            <NftDetailNote
              nftId={nft.dbid}
              authenticatedUserOwnsAsset={authenticatedUserOwnsAsset}
              nftCollectorsNote={nft.collectorsNote ?? ''}
            />
          )}
        </StyledAssetAndNoteContainer>

        <NftDetailText
          name={nft.name}
          description={nft.description}
          ownerUsername={username}
          contractAddress={nft.contractAddress}
          tokenId={nft.tokenId}
          externalUrl={nft.externalUrl}
          creatorAddress={nft.creatorAddress}
          openseaCollectionName={nft.openseaCollectionName}
        />
      </StyledContentContainer>
      {!useIsMobileOrMobileLargeWindowWidth && <StyledNavigationBuffer />}
      {rightArrow}
    </StyledBody>
  );
}

const StyledBody = styled.div`
  display: flex;
  width: 100%;

  @media only screen and ${breakpoints.mobile} {
  }

  @media only screen and ${breakpoints.desktop} {
    width: auto;
  }
`;

const StyledContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  width: 100%;

  @media only screen and ${breakpoints.tablet} {
    flex-direction: row;
  }

  @media only screen and ${breakpoints.desktop} {
    width: initial;
  }
`;

const StyledAssetAndNoteContainer = styled.div`
  position: relative;
  width: 100%;
`;

// We position the arrows using position absolute (so they reach the page bounds)
// But we still want there to be space taken up in the document flow, so that the arrows do not overlap with content
// This container simply creates space for the arrows to be positioned
const StyledNavigationBuffer = styled.div`
  width: 80px;
`;
