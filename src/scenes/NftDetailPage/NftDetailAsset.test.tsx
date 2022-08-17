import { render } from '@testing-library/react';
import NftDetailAsset from 'scenes/NftDetailPage/NftDetailAsset';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import { NftDetailAssetTestQuery } from '../../../__generated__/NftDetailAssetTestQuery.graphql';
import nock from 'nock';
import { getGraphqlHost, getGraphqlPath } from 'contexts/relay/relayFetchFunction';
import { NftDetailAssetTestQueryQuery } from '../../__generated__/operations';
import { RelayProvider } from 'contexts/relay/RelayProvider';
import { Suspense } from 'react';
import ShimmerContext from 'contexts/shimmer/ShimmerContext';

function Fixture() {
  const query = useLazyLoadQuery<NftDetailAssetTestQuery>(
    graphql`
      query NftDetailAssetTestQuery($collectionId: DBID!, $tokenId: DBID!) {
        collectionTokenById(collectionId: $collectionId, tokenId: $tokenId) {
          ... on CollectionToken {
            __typename
            ...NftDetailAssetFragment
          }
        }
      }
    `,
    { collectionId: 'testCollectionId', tokenId: 'testTokenId' }
  );

  if (query.collectionTokenById?.__typename !== 'CollectionToken') {
    throw new Error('yikes');
  }

  return <NftDetailAsset tokenRef={query.collectionTokenById} hasExtraPaddingForNote={false} />;
}

describe('NftDetailAsset', () => {
  it('can render', async () => {
    const response: NftDetailAssetTestQueryQuery = {
      __typename: 'Query',
      collectionTokenById: {
        __typename: 'CollectionToken',
        id: 'testCollectionTokenId',
        token: {
          id: 'testTokenId',
          contract: {
            id: 'testContractId',
            __typename: 'Contract',
            contractAddress: {
              __typename: 'ChainAddress',
              address: '0xmycooladdress',
            },
          },
          name: 'My Test Token',
          media: {
            __typename: 'ImageMedia',
            contentRenderURL: 'https://via.placeholder.com/150',
          },
        },
      },
    };

    const graphqlMock = nock(getGraphqlHost()).post(getGraphqlPath()).reply(200, {
      data: response,
    });

    const { findByAltText, debug } = render(
      <RelayProvider>
        <ShimmerContext>
          <Suspense fallback="Loading...">
            <Fixture />
          </Suspense>
        </ShimmerContext>
      </RelayProvider>
    );

    const image = await findByAltText('My Test Token');

    console.log(image);

    graphqlMock.done();
  });
});
