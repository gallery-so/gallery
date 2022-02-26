import { useEffect, useMemo } from 'react';
import styled from 'styled-components';

import breakpoints, { size, pageGutter } from 'components/core/breakpoints';
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
import { useBreakpoint } from 'hooks/useWindowSize';

import { isFeatureEnabled } from 'utils/featureFlag';

import { FeatureFlag, Directions } from 'components/core/enums';
import { useIsMobileWindowWidth } from 'hooks/useWindowSize';
import { useTrack } from 'contexts/analytics/AnalyticsContext';

import NavigationHandle from './NavigationHandle';
import useCollectionById from 'hooks/api/collections/useCollectionById';

type Props = {
  nftId: string;
};

function NftDetailPage({ nftId }: Props) {
  const { query } = useRouter();

  const screenWidth = useBreakpoint();
  const isMobileScreen = screenWidth === size.mobileLarge || screenWidth === size.mobile;

  const username = window.location.pathname.split('/')[1];
  const collectionId = query.collectionId as string;
  // TODO: Should refactor to utilize navigation context instead of session storage
  const isFromCollectionPage =
    globalThis?.sessionStorage?.getItem('prevPage') === `/${username}/${collectionId}`;

  const collectionNfts = useCollectionById({ id: collectionId })?.nfts;

  const collectionIndexOfNft = useMemo(
    () => collectionNfts?.findIndex((nft) => nft.id === nftId) ?? 0,
    [nftId, collectionNfts]
  );

  const prevNftId = collectionNfts ? collectionNfts[collectionIndexOfNft - 1]?.id ?? null : null;
  const nextNftId = collectionNfts ? collectionNfts[collectionIndexOfNft + 1]?.id ?? null : null;

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
          {!isMobileScreen && leftArrow}
          <StyledContentContainer>
            <StyledAssetAndNoteContainer>
              <ShimmerProvider>
                <NftDetailAsset
                  nft={nft}
                  hasExtraPaddingForNote={isCollectorsNoteEnabled && assetHasExtraPaddingForNote}
                  arrowLeft={isMobileScreen && leftArrow}
                  arrowRight={isMobileScreen && rightArrow}
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
          {!isMobileScreen && rightArrow}
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

export default NftDetailPage;
