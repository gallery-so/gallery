import { useEffect, useMemo } from 'react';
import styled from 'styled-components';

import breakpoints, { pageGutter } from 'components/core/breakpoints';
import ActionText from 'components/core/ActionText/ActionText';

import useNft from 'hooks/api/nfts/useNft';
import Page from 'components/core/Page/Page';
import ShimmerProvider from 'contexts/shimmer/ShimmerContext';
import GalleryRedirect from 'scenes/_Router/GalleryRedirect';
import NftDetailAsset from './NftDetailAsset';
import NftDetailText from './NftDetailText';
import NftDetailNote from './NftDetailNote';
import Head from 'next/head';
import { useRouter } from 'next/router';
import useBackButton from 'hooks/useBackButton';
import { usePossiblyAuthenticatedUser } from 'src/hooks/api/users/useUser';

import { isFeatureEnabled } from 'utils/featureFlag';

import { FeatureFlag, Directions } from 'components/core/enums';
import { useTrack } from 'contexts/analytics/AnalyticsContext';

import NavigationHandle from './NavigationHandle';
import useCollectionById from 'hooks/api/collections/useCollectionById';
import { useIsMobileWindowWidth, useIsMobileOrMobileLargeWindowWidth } from 'hooks/useWindowSize';

type Props = {
  nftId: string;
};

function NftDetailPage({ nftId }: Props) {
  const { query } = useRouter();

  const username = window.location.pathname.split('/')[1];
  const collectionId = query.collectionId as string;
  // TODO: Should refactor to utilize navigation context instead of session storage
  const isFromCollectionPage =
    globalThis?.sessionStorage?.getItem('prevPage') === `/${username}/${collectionId}`;

  const collectionNfts = useCollectionById({ id: collectionId })?.nfts;

  const { prevNftId, nextNftId } = useMemo(() => {
    if (!collectionNfts) {
      // TODO: send error to sentry. technically all NFTs should belong to a collection.
      return {
        prevNftId: null,
        nextNftId: null,
      };
    }

    const nftIndex = collectionNfts.findIndex((nft) => nft.id === nftId);
    if (nftIndex === -1) {
      // TODO: send error to sentry. technically the NFT should exist within the collection.
      return {
        prevNftId: null,
        nextNftId: null,
      };
    }

    return {
      prevNftId: collectionNfts[nftIndex - 1]?.id ?? null,
      nextNftId: collectionNfts[nftIndex + 1]?.id ?? null,
    };
  }, [collectionNfts, nftId]);

  const authenticatedUser = usePossiblyAuthenticatedUser();
  const authenticatedUserOwnsAsset = authenticatedUser?.username === username;

  const handleBackClick = useBackButton({ username });

  const nft = useNft({ id: nftId ?? '' });
  const headTitle = useMemo(() => `${nft?.name} - ${username} | Gallery`, [nft, username]);

  const track = useTrack();

  useEffect(() => {
    track('Page View: NFT Detail', { nftId });
  }, [nftId, track]);

  const assetHasNote = nft?.collectors_note !== '';
  const isCollectorsNoteEnabled = isFeatureEnabled(FeatureFlag.COLLECTORS_NOTE);

  const assetHasExtraPaddingForNote = assetHasNote || authenticatedUserOwnsAsset;

  const isMobile = useIsMobileWindowWidth();
  const isMobileOrMobileLarge = useIsMobileOrMobileLargeWindowWidth();

  if (!nft) {
    return <GalleryRedirect to="/404" />;
  }

  const leftArrow = prevNftId && (
    <NavigationHandle
      direction={Directions.LEFT}
      username={username}
      collectionId={collectionId}
      nftId={prevNftId}
    />
  );

  const rightArrow = nextNftId && (
    <NavigationHandle
      direction={Directions.RIGHT}
      username={username}
      collectionId={collectionId}
      nftId={nextNftId}
    />
  );

  return (
    <>
      <Head>
        <title>{headTitle}</title>
      </Head>
      <StyledNftDetailPage centered={!isMobile} fixedFullPageHeight>
        <StyledBackLink>
          <ActionText onClick={handleBackClick}>
            {isMobile
              ? '← Back'
              : isFromCollectionPage
              ? '← Back to collection'
              : '← Back to gallery'}
          </ActionText>
        </StyledBackLink>
        <StyledBody>
          {!isMobileOrMobileLarge && <StyledNavigationBuffer />}
          {leftArrow}
          <StyledContentContainer>
            <StyledAssetAndNoteContainer>
              <ShimmerProvider>
                <NftDetailAsset
                  nft={nft}
                  hasExtraPaddingForNote={isCollectorsNoteEnabled && assetHasExtraPaddingForNote}
                />
              </ShimmerProvider>
              {isCollectorsNoteEnabled && (authenticatedUserOwnsAsset || assetHasNote) && (
                <NftDetailNote
                  nftId={nft.id}
                  authenticatedUserOwnsAsset={authenticatedUserOwnsAsset}
                  nftCollectorsNote={nft?.collectors_note}
                />
              )}
            </StyledAssetAndNoteContainer>

            <NftDetailText nft={nft} />
          </StyledContentContainer>
          {!useIsMobileOrMobileLargeWindowWidth && <StyledNavigationBuffer />}
          {rightArrow}
        </StyledBody>
      </StyledNftDetailPage>
    </>
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

// mimics a navbar element on the top left corner
const StyledBackLink = styled.div`
  height: 80px;
  display: flex;
  align-items: center;

  position: absolute;
  left: 0;
  top: 0;
  z-index: 2;

  padding: 0 ${pageGutter.mobile}px;

  @media only screen and ${breakpoints.tablet} {
    padding: 0 ${pageGutter.tablet}px;
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

const StyledNftDetailPage = styled(Page)`
  @media only screen and ${breakpoints.mobile} {
    margin-left: ${pageGutter.mobile}px;
    margin-right: ${pageGutter.mobile}px;
    margin-bottom: 32px;
  }

  @media only screen and ${breakpoints.tablet} {
    margin-top: 0px;
    margin-left: ${pageGutter.tablet}px;
    margin-right: ${pageGutter.tablet}px;
  }

  @media only screen and ${breakpoints.desktop} {
    margin: 0px;
  }
`;

// We position the arrows using position absolute (so they reach the page bounds)
// But we still want there to be space taken up in the document flow, so that the arrows do not overlap with content
// This container simply creates space for the arrows to be positioned
const StyledNavigationBuffer = styled.div`
  width: 80px;
`;

export default NftDetailPage;
