import { useEffect, useState } from 'react';
import styled from 'styled-components';
import breakpoints, { pageGutter } from 'components/core/breakpoints';
import Head from 'next/head';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { graphql, useLazyLoadQuery } from 'react-relay';
import NftDetailView from './NftDetailView';
import { NftDetailPageQuery } from '__generated__/NftDetailPageQuery.graphql';
import { useRouter } from 'next/router';
import useNavigationArrows from './useNavigationArrows';

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
                nft {
                  dbid
                  name
                }
                ...useNavigationArrowsFragment
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

  const currentlySelectedCollectionNft = initialCollectionNft.collection?.nfts?.find(
    (nft) => nft?.nft?.dbid === nftId
  );
  console.log(currentlySelectedCollectionNft);

  if (!currentlySelectedCollectionNft) {
    // TODO: wrap this page in an error boundary that will capture and display a NotFound
    throw new Error('NftDetailPage: Selected NFT was not found within component');
  }

  const { leftArrow, rightArrow } = useNavigationArrows({
    queryRef: currentlySelectedCollectionNft,
    nftId,
    handleSetNftId: setNftId,
  });

  const {
    query: { username },
  } = useRouter();

  if (!username || Array.isArray(username)) {
    throw new Error('something has gone horribly wrong!');
  }

  const headTitle = `${currentlySelectedCollectionNft?.nft?.name} - ${username} | Gallery`;

  const authenticatedUserOwnsAsset =
    viewer?.__typename === 'Viewer' && viewer?.user?.username === username;

  return (
    <>
      <Head>
        <title>{headTitle}</title>
      </Head>
      <StyledNftDetailPage>
        {leftArrow}
        <NftDetailView
          username={username}
          authenticatedUserOwnsAsset={authenticatedUserOwnsAsset}
          queryRef={currentlySelectedCollectionNft}
        />
        {rightArrow}
      </StyledNftDetailPage>
    </>
  );
}

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
