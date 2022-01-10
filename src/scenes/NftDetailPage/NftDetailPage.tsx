import { useCallback, useMemo } from 'react';
import styled from 'styled-components';

import breakpoints, { pageGutter } from 'components/core/breakpoints';
import ActionText from 'components/core/ActionText/ActionText';

import useNft from 'hooks/api/nfts/useNft';
import Page from 'components/core/Page/Page';
import ShimmerProvider from 'contexts/shimmer/ShimmerContext';
import GalleryRedirect from 'scenes/_Router/GalleryRedirect';
import NftDetailAsset from './NftDetailAsset';
import NftDetailText from './NftDetailText';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCanGoBack } from 'contexts/navigation/CanGoBackProvider';

type Props = {
  nftId: string;
};

function NftDetailPage({ nftId }: Props) {
  const { replace, back } = useRouter();
  const canGoBack = useCanGoBack();

  const username = window.location.pathname.split('/')[1];

  const handleBackClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (event.metaKey) {
        window.open(`/${username}`);
        return;
      }

      if (canGoBack) {
        // If the user has history in their stack, simply send them back to where they came from.
        // this ensures scroll position is maintained when going back (see: GalleryNavigationContext.tsx)
        back();
      } else {
        // if the user arrived on the page via direct link, send them to the
        // owner's profile page (since there is no "previous page")
        // NOTE: this scheme will have to change if we no longer have the
        // username included in the URL
        void replace(`/${username}`);
      }
    },
    [back, canGoBack, replace, username]
  );

  const nft = useNft({ id: nftId ?? '' });
  const headTitle = useMemo(() => `${nft?.name} - ${username} | Gallery`, [nft, username]);

  if (!nft) {
    return <GalleryRedirect to="/404" />;
  }

  return (
    <>
      <Head>
        <title>{headTitle}</title>
        <meta property="og:title" content={headTitle} key="og:title" />
        <meta name="twitter:title" content={headTitle} key="twitter:title" />
      </Head>
      <StyledNftDetailPage centered fixedFullPageHeight>
        <StyledBackLink>
          <ActionText onClick={handleBackClick}>← Back to gallery</ActionText>
        </StyledBackLink>
        <StyledBody>
          {/* {prevNftId && (
          <NavigationHandle
            direction={Directions.LEFT}
            nftId={prevNftId}
          ></NavigationHandle>
        )} */}
          <StyledContentContainer>
            <ShimmerProvider>
              <NftDetailAsset nft={nft} />
            </ShimmerProvider>
            <NftDetailText nft={nft} />
          </StyledContentContainer>
          {/* {nextNftId && (
          <NavigationHandle
            direction={Directions.RIGHT}
            nftId={nextNftId}
          ></NavigationHandle>
        )} */}
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

const StyledNftDetailPage = styled(Page)`
  @media only screen and ${breakpoints.mobile} {
    margin-left: ${pageGutter.mobile}px;
    margin-right: ${pageGutter.mobile}px;
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
