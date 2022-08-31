import { act, fireEvent, render } from '@testing-library/react';
import AppProvider from 'contexts/AppProvider';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { NftDetailAssetTestQuery } from '../../../__generated__/NftDetailAssetTestQuery.graphql';
import { mockProviderQueries } from '../../../tests/graphql/mockProviderQueries';
import { mockGraphqlQuery } from '../../../tests/graphql/mockGraphqlQuery';
import {
  NftDetailAssetTestQueryQuery,
  UseNftRetryMutationMutation,
} from '../../__generated__/operations';
import NftDetailView from 'scenes/NftDetailPage/NftDetailView';

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

  return (
    <NftDetailView
      authenticatedUserOwnsAsset={false}
      username="TestUsername"
      queryRef={query.collectionTokenById}
    />
  );
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
        contractAddress: {
          address: '0x0Ff979fB365e20c09bE06676D569EF581a46621D',
        },
      },
    },
  },
};

const RetryImageMediaResponse: UseNftRetryMutationMutation = {
  __typename: 'Mutation',
  refreshToken: {
    __typename: 'RefreshTokenPayload',
    token: {
      __typename: 'Token',
      id: 'Token:testTokenId',
      dbid: 'testTokenId',
      name: 'Test Token Name',
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
        name: 'Test Contract Name',
        contractAddress: {
          address: '0x0Ff979fB365e20c09bE06676D569EF581a46621D',
        },
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
    mockGraphqlQuery('useNftRetryMutation', RetryImageMediaResponse);

    const { findByText, findByTestId, findByAltText } = render(
      <AppProvider>
        <Fixture />
      </AppProvider>
    );

    // Ensure we see the fallback UI since we have bad media
    expect(await findByText('Could not load')).toBeVisible();

    // Hit the refresh button
    await act(async () => {
      fireEvent.click(await findByTestId('RefreshButton'));
    });

    // Make sure we see the fallback's loading state
    expect(await findByText('Loading...')).toBeVisible();

    // See the updated image!
    expect(await findByAltText('Test Token Name')).toBeVisible();
  });
});
