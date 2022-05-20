import { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import breakpoints, { pageGutter } from 'components/core/breakpoints';
import Head from 'next/head';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { graphql, useLazyLoadQuery } from 'react-relay';
import NftDetailView from './NftDetailView';
import { NftDetailPageQuery } from '__generated__/NftDetailPageQuery.graphql';
import { useRouter } from 'next/router';
import transitions from 'components/core/transitions';
import { Directions } from 'components/core/enums';
import useKeyDown from 'hooks/useKeyDown';
import NavigationHandle from './NavigationHandle';
import { removeNullValues } from 'utils/removeNullValues';
import shiftNftCarousel, { MountedNft } from './utils/shiftNftCarousel';

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
                # ...useNavigationArrowsFragment
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
    // captureException('NftDetailPage: requested nft did not return a CollectionNft');
    // return <NotFound resource="nft" />;

    // TODO: wrap this page in an error boundary that will capture and display a NotFound
    throw new Error('NftDetailPage: requested nft did not return a CollectionNft');
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
    throw new Error('something has gone horribly wrong!');
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

  // TODO: write comment about how this works
  const [mountedNfts, setMountedNfts] = useState<MountedNft<typeof prevNft>[]>(
    removeNullValues([
      prevNft ? { nft: prevNft, visibility: 'hidden-left' } : null,
      { nft: selectedNft, visibility: 'visible' },
      nextNft ? { nft: nextNft, visibility: 'hidden-right' } : null,
    ])
  );

  // TODO: write comment
  const pushToNftById = useCallback(
    (nftId: string) => {
      const querystring = new URLSearchParams(urlQuery as Record<string, string>).toString();
      const currentLocation = `${pathname}?${querystring}`;
      push(
        // href
        currentLocation,
        // as
        `/${username}/${initialCollectionId}/${nftId}`
      );
    },
    [initialCollectionId, pathname, push, urlQuery, username]
  );

  const handleNextPress = useCallback(() => {
    if (nextNft) {
      setNftId(nextNft.nft.dbid);
      setMountedNfts((prevMountedNfts) => {
        return shiftNftCarousel(Directions.RIGHT, prevMountedNfts, selectedNftIndex, collection);
      });
      pushToNftById(nextNft.nft.dbid);
    }
  }, [collection, nextNft, pushToNftById, selectedNftIndex]);

  const handlePrevPress = useCallback(() => {
    if (prevNft) {
      setNftId(prevNft.nft.dbid);
      setMountedNfts((prevMountedNfts) => {
        return shiftNftCarousel(Directions.LEFT, prevMountedNfts, selectedNftIndex, collection);
      });
    }
  }, [collection, prevNft, selectedNftIndex]);

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
      return 'translate(10px,0px)';
    }
    if (visibility === 'hidden-left') {
      return 'translate(-10px,0px)';
    }
  }};
  z-index: ${({ visibility }) => (visibility === 'visible' ? 1 : 0)};

  transition: ${transitions.cubic};
`;

const StyledNftDetailPage = styled.div`
  // position: relative;
  // @media only screen and ${breakpoints.mobile} {
  //   margin-left: ${pageGutter.mobile}px;
  //   margin-right: ${pageGutter.mobile}px;
  //   margin-bottom: 32px;
  // }

  // @media only screen and ${breakpoints.tablet} {
  //   margin-top: 0px;
  //   margin-left: ${pageGutter.tablet}px;
  //   margin-right: ${pageGutter.tablet}px;
  // }

  // @media only screen and ${breakpoints.desktop} {
  //   margin: 0px;
  // }

  width: 100vw;
  height: 100vh;

  display: flex;
  justify-content: center;
  align-items: center;
`;

export default NftDetailPage;
