import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import Head from 'next/head';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { graphql, useLazyLoadQuery } from 'react-relay';
import NftDetailView from './NftDetailView';
import { NftDetailPageQuery } from '__generated__/NftDetailPageQuery.graphql';
import { useRouter } from 'next/router';
import transitions, {
  ANIMATED_COMPONENT_TRANSLATION_PIXELS_LARGE,
} from 'components/core/transitions';
import { Directions } from 'components/core/enums';
import useKeyDown from 'hooks/useKeyDown';
import NavigationHandle from './NavigationHandle';
import { removeNullValues } from 'utils/removeNullValues';
import shiftNftCarousel, { MountedNft } from './utils/shiftNftCarousel';
import FullPageLoader from 'components/core/Loader/FullPageLoader';
import ErrorBoundary from 'contexts/boundary/ErrorBoundary';
import breakpoints, { pageGutter } from 'components/core/breakpoints';

type Props = {
  nftId: string;
  collectionId: string;
};

function NftDetailPage({ nftId: initialNftId, collectionId: initialCollectionId }: Props) {
  const query = useLazyLoadQuery<NftDetailPageQuery>(
    graphql`
      query NftDetailPageQuery($nftId: DBID!, $collectionId: DBID!) {
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
            collection {
              nfts {
                nft @required(action: THROW) {
                  dbid
                  name
                }
                ...NftDetailViewFragment
              }
            }
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
    { nftId: initialNftId, collectionId: initialCollectionId }
  );

  const { collectionNft: initialCollectionNft, viewer } = query;

  const [nftId, setNftId] = useState(initialNftId);

  const track = useTrack();
  useEffect(() => {
    track('Page View: NFT Detail', { nftId });
  }, [nftId, track]);

  if (initialCollectionNft?.__typename !== 'CollectionNft') {
    throw new Error('NftDetailPage: CollectionNft for requested NFT not found');
  }

  const collection = removeNullValues(initialCollectionNft.collection?.nfts);

  if (!collection) {
    throw new Error('NftDetailPage: Collection of NFTs not found');
  }

  const { selectedNftIndex, selectedNft } = useMemo(() => {
    const index = collection.findIndex(({ nft }) => nft.dbid === nftId);
    if (index === -1) {
      throw new Error('NFT Detail Page: NFT index not found within collection');
    }
    return { selectedNftIndex: index, selectedNft: collection[index] };
  }, [nftId, collection]);

  const { query: urlQuery, push, pathname } = useRouter();
  const { username } = urlQuery;

  if (!username || Array.isArray(username)) {
    throw new Error('NFT Detail Page: username not found in page query params');
  }

  const headTitle = `${selectedNft?.nft?.name} - ${username} | Gallery`;

  const authenticatedUserOwnsAsset =
    viewer?.__typename === 'Viewer' && viewer?.user?.username === username;

  const { prevNft, nextNft } = useMemo(() => {
    const prevNft = collection[selectedNftIndex - 1] ?? null;
    const nextNft = collection[selectedNftIndex + 1] ?? null;

    return {
      prevNft,
      nextNft,
    };
  }, [collection, selectedNftIndex]);

  /**
   * This state will keep track of up-to-3 NFTs that are mounted on the DOM:
   *
   *            [hidden-left]    [visible]    [hidden-right]
   * opacity :        0              1              0
   * position:      -10px            0px          +10px
   *
   * You can picture the "current" NFT as the middle one, while the left and right
   * NFTs are hidden on either side. This will allow the adjacent NFTs to slide in
   * smoothly as the user navigates left and right. Edge cases are handled accordingly
   * in the `shiftNftCarousel` util function.
   */
  const [mountedNfts, setMountedNfts] = useState<MountedNft<typeof prevNft>[]>(
    removeNullValues([
      prevNft ? { nft: prevNft, visibility: 'hidden-left' } : null,
      { nft: selectedNft, visibility: 'visible' },
      nextNft ? { nft: nextNft, visibility: 'hidden-right' } : null,
    ])
  );

  // Redirects user to view an adjacent NFT
  const pushToNftById = useCallback(
    (nftId: string) => {
      // TODO: this attempts to fix a suspense call that gets triggered when moving between
      // NFTs after a user arrives directly at an NFT detail page /[username]/[collectionId]/[nftId].
      // stabiliizing someone works, but it still calls the collection data.
      //
      // possible solution 1: pre-load the Collection Page data if a user arrives directly
      // on an NFT Detail Page
      //
      // possible solution 2: figure out why the page is making an imperative request for data
      // that should technically be in the cache. ask terence?!
      //
      // const stabilizedPathname = pathname.includes('[nftId]')
      //   ? '/[username]/[collectionId]'
      //   : pathname;
      //-------------–––----------------

      const querystring = new URLSearchParams(urlQuery as Record<string, string>).toString();
      const currentLocation = `${pathname}?${querystring}`;
      push(
        // This `href` param will remain the same, so that it feels like the user is rooted in a modal
        // and not navigating between pages (even while the URL is changing).
        currentLocation,
        // This `as` param is purely cosmetic and determines what users will see in the address bar.
        `/${username}/${initialCollectionId}/${nftId}`,
        // Prevent scroll-to-top when navigating
        { scroll: false }
      );
    },
    [initialCollectionId, pathname, push, urlQuery, username]
  );

  const handleNextPress = useCallback(() => {
    if (nextNft) {
      const nextNftId = nextNft.nft.dbid;
      setNftId(nextNftId);
      setMountedNfts((prevMountedNfts) => {
        return shiftNftCarousel(Directions.RIGHT, prevMountedNfts, selectedNftIndex, collection);
      });
      pushToNftById(nextNftId);
    }
  }, [collection, nextNft, pushToNftById, selectedNftIndex]);

  const handlePrevPress = useCallback(() => {
    if (prevNft) {
      const prevNftId = prevNft.nft.dbid;
      setNftId(prevNftId);
      setMountedNfts((prevMountedNfts) => {
        return shiftNftCarousel(Directions.LEFT, prevMountedNfts, selectedNftIndex, collection);
      });
      pushToNftById(prevNftId);
    }
  }, [collection, prevNft, pushToNftById, selectedNftIndex]);

  useKeyDown('ArrowRight', handleNextPress);
  useKeyDown('ArrowLeft', handlePrevPress);

  return (
    <>
      <Head>
        <title>{headTitle}</title>
      </Head>
      <StyledNftDetailPage>
        {prevNft && <NavigationHandle direction={Directions.LEFT} onClick={handlePrevPress} />}
        {mountedNfts.map(({ nft, visibility }) => (
          <_DirectionalFade key={nft.nft.dbid} visibility={visibility}>
            <NftDetailView
              username={username}
              authenticatedUserOwnsAsset={authenticatedUserOwnsAsset}
              queryRef={nft}
            />
          </_DirectionalFade>
        ))}
        {nextNft && <NavigationHandle direction={Directions.RIGHT} onClick={handleNextPress} />}
      </StyledNftDetailPage>
    </>
  );
}

const _DirectionalFade = styled.div<{ visibility: string }>`
  position: absolute;
  opacity: ${({ visibility }) => (visibility === 'visible' ? 1 : 0)};
  transform: ${({ visibility }) => {
    if (visibility === 'visible') {
      return 'translate(0px,0px)';
    }
    if (visibility === 'hidden-right') {
      return `translate(${ANIMATED_COMPONENT_TRANSLATION_PIXELS_LARGE}px,0px)`;
    }
    if (visibility === 'hidden-left') {
      return `translate(-${ANIMATED_COMPONENT_TRANSLATION_PIXELS_LARGE}px,0px)`;
    }
  }};
  z-index: ${({ visibility }) => (visibility === 'visible' ? 1 : 0)};

  transition: ${transitions.cubic};
`;

const StyledNftDetailPage = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  justify-content: center;

  @media only screen and ${breakpoints.mobile} {
    ${_DirectionalFade} {
      padding: 80px ${pageGutter.tablet}px 0px ${pageGutter.tablet}px;
    }
  }

  @media only screen and ${breakpoints.tablet} {
    align-items: center;
    ${_DirectionalFade} {
      padding: 0;
    }
  }
`;

function NftDetailPageWithBoundary({ collectionId, nftId }: Props) {
  return (
    <StyledNftDetailPageWithBoundary>
      <Suspense fallback={<FullPageLoader />}>
        <ErrorBoundary>
          <NftDetailPage collectionId={collectionId} nftId={nftId} />
        </ErrorBoundary>
      </Suspense>
    </StyledNftDetailPageWithBoundary>
  );
}

const StyledNftDetailPageWithBoundary = styled.div`
  width: 100vw;
  height: 100vh;
`;

export default NftDetailPageWithBoundary;
