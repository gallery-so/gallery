import { fireEvent, render } from '@testing-library/react';
import { graphql, useLazyLoadQuery } from 'react-relay';

import AppProvider from '~/contexts/AppProvider';
import { createEmptyRelayEnvironment } from '~/contexts/relay/RelayProvider';
import { NftDetailAssetTestQuery } from '~/generated/NftDetailAssetTestQuery.graphql';
import NftDetailView from '~/scenes/NftDetailPage/NftDetailView';
import {
  Chain,
  NftDetailAssetTestQueryQuery,
  NftErrorContextRetryMutationMutation,
} from '~/tests/__generated__/graphql-codegen/operations';
import { mockGraphqlQuery } from '~/tests/graphql/mockGraphqlQuery';
import { mockProviderQueries } from '~/tests/graphql/mockProviderQueries';

function Fixture() {
  const query = useLazyLoadQuery<NftDetailAssetTestQuery>(
    graphql`
      query NftDetailAssetTestQuery($collectionId: DBID!, $tokenId: DBID!) {
        collectionTokenById(collectionId: $collectionId, tokenId: $tokenId) {
          ... on CollectionToken {
            __typename
            ...NftDetailViewFragment
          }
        }
      }
    `,
    { collectionId: 'testCollectionId', tokenId: 'testTokenId' }
  );

  if (query.collectionTokenById?.__typename !== 'CollectionToken') {
    throw new Error('Yikes');
  }

  return <NftDetailView authenticatedUserOwnsAsset={false} queryRef={query.collectionTokenById} />;
}

const UnknownMediaResponse: NftDetailAssetTestQueryQuery = {
  collectionTokenById: {
    __typename: 'CollectionToken',
    id: 'CollectionToken:testCollectionTokenId',
    collection: {
      __typename: 'Collection',
      id: 'Collection:testCollectionId',
      dbid: 'testCollectionId',
    },
    token: {
      id: 'Token:testTokenId',
      dbid: 'testTokenId',
      chain: Chain.Ethereum,
      tokenMetadata: '{}',
      owner: {
        id: 'GalleryUser:TestOwnerId',
        username: 'Test Username',
      },
      name: 'Test Token Name',
      description: 'Test Description',
      tokenId: '1',
      externalUrl: 'http://someurl.com',
      collectorsNote: 'Test Collectors Note',
      media: {
        __typename: 'UnknownMedia',
        contentRenderURL: 'bad url here',
      },
      contract: {
        __typename: 'Contract',
        id: 'Contract:someContractId',
        name: 'Test Contract Name',
        chain: Chain.Ethereum,
        creatorAddress: {
          chain: Chain.Ethereum,
          address: '0x0Ff979fB365e20c09bE06676D569EF581a46621D',
        },
        contractAddress: {
          chain: Chain.Ethereum,
          address: '0x0Ff979fB365e20c09bE06676D569EF581a46621D',
        },
        badgeURL: 'http://someurl.com',
      },
    },
  },
};

const RetryImageMediaResponse: NftErrorContextRetryMutationMutation = {
  __typename: 'Mutation',
  refreshToken: {
    __typename: 'RefreshTokenPayload',
    token: {
      __typename: 'Token',
      id: 'Token:testTokenId',
      dbid: 'testTokenId',
      name: 'Test Token Name',
      chain: Chain.Ethereum,
      media: {
        __typename: 'ImageMedia',
        contentRenderURL: 'bad url here',
        previewURLs: {
          small: 'http://someimage.com',
          medium: 'http://someimage.com',
          large: 'http://someimage.com',
        },
      },
      contract: {
        __typename: 'Contract',
        id: 'Contract:someContractId',
        chain: Chain.Ethereum,
        name: 'Test Contract Name',
        contractAddress: {
          address: '0x0Ff979fB365e20c09bE06676D569EF581a46621D',
        },
        badgeURL: 'http://someimage.com',
      },
    },
  },
};

describe('NftDetailAsset', () => {
  it('can render', async () => {
    mockProviderQueries();

    // Mock the query for our Fixture
    mockGraphqlQuery('NftDetailAssetTestQuery', UnknownMediaResponse);

    // Mock the retry for when they hit the button
    mockGraphqlQuery('NftErrorContextRetryMutation', RetryImageMediaResponse);

    const relayEnvironment = createEmptyRelayEnvironment();
    const { findByText, findByTestId, findByAltText } = render(
      <AppProvider relayEnvironment={relayEnvironment}>
        <Fixture />
      </AppProvider>
    );

    // Ensure we see the fallback UI since we have bad media
    expect(await findByText('Could not load', undefined, { timeout: 10000 })).toBeInTheDocument();

    // Hit the refresh button
    fireEvent.click(await findByTestId('RefreshButton'));

    // Make sure we see the fallback's loading state
    expect(await findByText('Loading...')).toBeInTheDocument();

    // See the updated image!
    expect(await findByAltText('Test Token Name')).toBeInTheDocument();
  });
});
