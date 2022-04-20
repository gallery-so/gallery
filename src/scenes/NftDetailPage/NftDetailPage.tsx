import { useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import breakpoints, { pageGutter } from 'components/core/breakpoints';
import ActionText from 'components/core/ActionText/ActionText';
import Page from 'components/core/Page/Page';
import Head from 'next/head';
import { useRouter } from 'next/router';
import useBackButton from 'hooks/useBackButton';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { useIsMobileWindowWidth } from 'hooks/useWindowSize';
import StyledBackLink from 'components/NavbarBackLink/NavbarBackLink';
import { graphql, useFragment } from 'react-relay';
import NotFound from 'scenes/NotFound/NotFound';
import { NftDetailPageFragment$key } from '__generated__/NftDetailPageFragment.graphql';
import NftDetailView from './NftDetailView';
import { captureException } from '@sentry/nextjs';

import useKeyDown from 'hooks/useKeyDown';

type Props = {
  nftId: string;
  queryRef: NftDetailPageFragment$key;
};

function NftDetailPage({ nftId, queryRef }: Props) {
  const { collectionNft, viewer } = useFragment(
    graphql`
      fragment NftDetailPageFragment on Query {
        collectionNft: collectionNftById(nftId: $nftId, collectionId: $collectionId) {
          ... on ErrNftNotFound {
            __typename
          }

          ... on ErrCollectionNotFound {
            __typename
          }

          ... on CollectionNft {
            __typename
            nft {
              dbid
              name
            }
            ...NftDetailViewFragment
          }
        }

        viewer {
          __typename
          ... on Viewer {
            user {
              username
            }
          }
        }
      }
    `,
    queryRef
  );

  const {
    query: { collectionId },
  } = useRouter();
  const username = window.location.pathname.split('/')[1];
  const isMobile = useIsMobileWindowWidth();
  const track = useTrack();
  const handleBackClick = useBackButton({ username });

  useEffect(() => {
    track('Page View: NFT Detail', { nftId });
  }, [nftId, track]);

  // TODO: Should refactor to utilize navigation context instead of session storage
  const isFromCollectionPage =
    globalThis?.sessionStorage?.getItem('prevPage') === `/${username}/${collectionId}`;

  if (collectionNft?.__typename !== 'CollectionNft') {
    captureException('NftDetailPage: requested nft did not return a CollectionNft');
    return <NotFound resource="nft" />;
  }

  const headTitle = `${collectionNft?.nft?.name} - ${username} | Gallery`;

  const authenticatedUserOwnsAsset =
    viewer?.__typename === 'Viewer' && viewer?.user?.username === username;

  const { replace, back } = useRouter();
  const navigateToId = function (nftId: string) {
    void replace(`/${username}/${collectionId}/${nftId}`);
  };

  const nextPress = useKeyDown('ArrowRight');
  const prevPress = useKeyDown('ArrowLeft');
  const escapePress = useKeyDown('Escape');
  const backspacePress = useKeyDown('Backspace');

  useEffect(() => {
    if (nextPress && nextNftId) {
      navigateToId(nextNftId);
    }
    if (prevPress && prevNftId) {
      navigateToId(prevNftId);
    }
    if (escapePress || backspacePress) {
      handleBackClick();
    }
  }, [nextPress, prevPress, escapePress, backspacePress]);

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
        <NftDetailView
          username={username}
          authenticatedUserOwnsAsset={authenticatedUserOwnsAsset}
          queryRef={collectionNft}
          nftId={nftId}
        />
      </StyledNftDetailPage>
    </>
  );
}

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
