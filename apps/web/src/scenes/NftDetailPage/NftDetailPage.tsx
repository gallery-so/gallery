import Head from 'next/head';
import { useRouter } from 'next/router';
import { route } from 'nextjs-routes';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';
import styled from 'styled-components';

import breakpoints, { pageGutter } from '~/components/core/breakpoints';
import { Directions } from '~/components/core/enums';
import transitions, {
  ANIMATED_COMPONENT_TRANSLATION_PIXELS_LARGE,
} from '~/components/core/transitions';
import { NOTES_PER_PAGE } from '~/components/Feed/Socialize/CommentsModal/CommentsModal';
import ErrorBoundary from '~/contexts/boundary/ErrorBoundary';
import { NftDetailPageFragment$key } from '~/generated/NftDetailPageFragment.graphql';
import { NftDetailPageQuery } from '~/generated/NftDetailPageQuery.graphql';
import { NftDetailPageQueryFragment$key } from '~/generated/NftDetailPageQueryFragment.graphql';
import useKeyDown from '~/hooks/useKeyDown';
import NotFound from '~/scenes/NotFound/NotFound';
import GalleryViewEmitter from '~/shared/components/GalleryViewEmitter';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import NavigationHandle from './NavigationHandle';
import NftDetailPageFallback from './NftDetailPageFallback';
import NftDetailView from './NftDetailView';
import shiftNftCarousel, { MountedNft } from './utils/shiftNftCarousel';

type NftDetailPageProps = {
  username: string;
  collectionId: string;

  collectionTokenRef: NftDetailPageFragment$key;
  queryRef: NftDetailPageQueryFragment$key;
};

function NftDetailPage({
  collectionTokenRef,
  queryRef,
  username,
  collectionId: initialCollectionId,
}: NftDetailPageProps) {
  const query = useFragment(
    graphql`
      fragment NftDetailPageQueryFragment on Query {
        viewer {
          __typename
          ... on Viewer {
            user {
              username
            }
          }
        }

        ...NftDetailViewQueryFragment
        ...GalleryViewEmitterWithSuspenseFragment
      }
    `,
    queryRef
  );

  const initialCollectionNft = useFragment(
    graphql`
      fragment NftDetailPageFragment on CollectionToken {
        __typename
        token @required(action: THROW) {
          dbid
          name
        }
        collection {
          tokens {
            token @required(action: THROW) {
              dbid
              name
            }
            ...NftDetailViewFragment
          }
        }
      }
    `,
    collectionTokenRef
  );

  const [tokenId, setNftId] = useState(initialCollectionNft.token.dbid);

  const track = useTrack();
  useEffect(() => {
    track('Page View: NFT Detail', { tokenId }, true);
  }, [tokenId, track]);

  const collection = removeNullValues(initialCollectionNft.collection?.tokens);

  const { selectedNftIndex, selectedNft } = useMemo(() => {
    const index = collection.findIndex(({ token }) => token.dbid === tokenId);

    return { selectedNftIndex: index, selectedNft: collection[index] };
  }, [tokenId, collection]);

  const { query: urlQuery, push, pathname } = useRouter();

  if (!username || Array.isArray(username)) {
    throw new Error('NFT Detail Page: username not found in page query params');
  }

  const headTitle = `${selectedNft?.token?.name} - ${username} | Gallery`;

  const authenticatedUserOwnsAsset =
    query.viewer?.__typename === 'Viewer' && query.viewer?.user?.username === username;

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
  const [mountedNfts, setMountedNfts] = useState<MountedNft<NonNullable<typeof prevNft>>[]>(() => {
    return removeNullValues([
      prevNft ? { token: prevNft, visibility: 'hidden-left' } : null,
      selectedNft ? { token: selectedNft, visibility: 'visible' } : null,
      nextNft ? { token: nextNft, visibility: 'hidden-right' } : null,
    ]);
  });

  // Redirects user to view an adjacent NFT
  const pushToNftById = useCallback(
    (tokenId: string) => {
      // TODO: this attempts to fix a suspense call that gets triggered when moving between
      // NFTs after a user arrives directly at an NFT detail page /[username]/[collectionId]/[tokenId].
      // stabiliizing someone works, but it still calls the collection data.
      //
      // possible solution 1: pre-load the Collection Page data if a user arrives directly
      // on an NFT Detail Page
      //
      // possible solution 2: figure out why the page is making an imperative request for data
      // that should technically be in the cache. ask terence?!
      //
      // const stabilizedPathname = pathname.includes('[tokenId]')
      //   ? '/[username]/[collectionId]'
      //   : pathname;
      //-------------–––----------------

      const querystring = new URLSearchParams(urlQuery as Record<string, string>).toString();
      const currentLocation = `${pathname}?${querystring}`;
      push(
        // This `href` param will remain the same, so that it feels like the user is rooted in a modal
        // and not navigating between pages (even while the URL is changing).
        // @ts-expect-error href is guaranteed to be be a valid path
        currentLocation,
        // This `as` param is purely cosmetic and determines what users will see in the address bar.
        route({
          pathname: '/[username]/[collectionId]/[tokenId]',
          query: { username, collectionId: initialCollectionId, tokenId },
        }),
        // Prevent scroll-to-top when navigating
        { scroll: false }
      );
    },
    [initialCollectionId, pathname, push, urlQuery, username]
  );

  const handleNextPress = useCallback(() => {
    if (nextNft) {
      const nextNftId = nextNft.token.dbid;
      setNftId(nextNftId);
      setMountedNfts((prevMountedNfts) => {
        return shiftNftCarousel(Directions.RIGHT, prevMountedNfts, selectedNftIndex, collection);
      });
      pushToNftById(nextNftId);
    }
  }, [collection, nextNft, pushToNftById, selectedNftIndex]);

  const handlePrevPress = useCallback(() => {
    if (prevNft) {
      const prevNftId = prevNft.token.dbid;
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
      <GalleryViewEmitter queryRef={query} />
      {prevNft && <NavigationHandle direction={Directions.LEFT} onClick={handlePrevPress} />}
      {mountedNfts.map(({ token, visibility }) => (
        <_DirectionalFade key={token.token.dbid} visibility={visibility}>
          <NftDetailView
            queryRef={query}
            collectionTokenRef={token}
            authenticatedUserOwnsAsset={authenticatedUserOwnsAsset}
            visibility={visibility}
          />
        </_DirectionalFade>
      ))}
      {nextNft && <NavigationHandle direction={Directions.RIGHT} onClick={handleNextPress} />}
    </>
  );
}

type NftDetailPageWrapperProps = {
  username: string;
  tokenId: string;
  collectionId: string;
};

function NftDetailPageWrapper({ username, tokenId, collectionId }: NftDetailPageWrapperProps) {
  const query = useLazyLoadQuery<NftDetailPageQuery>(
    graphql`
      query NftDetailPageQuery(
        $tokenId: DBID!
        $collectionId: DBID!
        $username: String!
        $interactionsFirst: Int!
        $interactionsAfter: String
      ) {
        collectionNft: collectionTokenById(tokenId: $tokenId, collectionId: $collectionId) {
          ... on ErrTokenNotFound {
            __typename
          }

          ... on ErrCollectionNotFound {
            __typename
          }

          ... on CollectionToken {
            __typename
            ...NftDetailPageFragment

            collection {
              tokens {
                token {
                  dbid
                }
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

        ...NftDetailPageQueryFragment
      }
    `,
    { tokenId, collectionId, username, interactionsFirst: NOTES_PER_PAGE }
  );

  const collectionHasToken = useMemo(() => {
    if (query.collectionNft?.__typename !== 'CollectionToken') {
      return false;
    }

    return query.collectionNft.collection?.tokens?.some((token) => token?.token?.dbid === tokenId);
  }, [query.collectionNft, tokenId]);

  if (query.collectionNft?.__typename !== 'CollectionToken' || !collectionHasToken) {
    return (
      <StyledNftDetailPage>
        <NotFound />
      </StyledNftDetailPage>
    );
  }

  return (
    <>
      <StyledNftDetailPage>
        <NftDetailPage
          queryRef={query}
          username={username}
          collectionTokenRef={query.collectionNft}
          collectionId={collectionId}
        />
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
  height: 100vh;

  display: flex;
  justify-content: center;

  @media only screen and ${breakpoints.mobile} {
    ${_DirectionalFade} {
      padding: 48px ${pageGutter.tablet}px 0px ${pageGutter.tablet}px;
    }
  }

  @media only screen and ${breakpoints.tablet} {
    align-items: center;
    ${_DirectionalFade} {
      padding: 0;
    }
  }
`;

function NftDetailPageWithBoundary({ username, collectionId, tokenId }: NftDetailPageWrapperProps) {
  return (
    <StyledNftDetailPageWithBoundary>
      <Suspense fallback={<NftDetailPageFallback tokenId={tokenId} />}>
        <ErrorBoundary>
          <NftDetailPageWrapper username={username} collectionId={collectionId} tokenId={tokenId} />
        </ErrorBoundary>
      </Suspense>
    </StyledNftDetailPageWithBoundary>
  );
}

const StyledNftDetailPageWithBoundary = styled.div`
  width: 100vw;
`;

export default NftDetailPageWithBoundary;
