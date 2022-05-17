import { useEffect } from 'react';
import styled from 'styled-components';
import breakpoints, { pageGutter } from 'components/core/breakpoints';
import Head from 'next/head';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { graphql, useLazyLoadQuery } from 'react-relay';
import NotFound from 'scenes/NotFound/NotFound';
import NftDetailView from './NftDetailView';
import { captureException } from '@sentry/nextjs';
import { NftDetailPageQuery } from '__generated__/NftDetailPageQuery.graphql';
import { useRouter } from 'next/router';

type Props = {
  nftId: string;
  collectionId: string;
};

function NftDetailPage({ nftId, collectionId }: Props) {
  const { collectionNft, viewer } = useLazyLoadQuery<NftDetailPageQuery>(
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
    { nftId, collectionId }
  );

  const { query: routerQuery } = useRouter();
  console.log({ routerQuery });

  const username = window.location.pathname.split('/')[1];
  const track = useTrack();

  useEffect(() => {
    track('Page View: NFT Detail', { nftId });
  }, [nftId, track]);

  if (collectionNft?.__typename !== 'CollectionNft') {
    captureException('NftDetailPage: requested nft did not return a CollectionNft');
    return <NotFound resource="nft" />;
  }

  const headTitle = `${collectionNft?.nft?.name} - ${username} | Gallery`;

  const authenticatedUserOwnsAsset =
    viewer?.__typename === 'Viewer' && viewer?.user?.username === username;

  return (
    <>
      <Head>
        <title>{headTitle}</title>
      </Head>
      <StyledNftDetailPage>
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
