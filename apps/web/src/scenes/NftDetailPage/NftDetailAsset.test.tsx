import { fireEvent, render } from '@testing-library/react';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { NOTES_PER_PAGE } from '~/components/Feed/Socialize/CommentsModal/CommentsModal';
import { NftDetailAssetTestQuery } from '~/generated/NftDetailAssetTestQuery.graphql';
import NftDetailView from '~/scenes/NftDetailPage/NftDetailView';
import { MockAppProvider } from '~/tests/graphql/MockAppProvider';
import { mockGraphqlQuery } from '~/tests/graphql/mockGraphqlQuery';
import { mockProviderQueries } from '~/tests/graphql/mockProviderQueries';

function Fixture() {
  const query = useLazyLoadQuery<NftDetailAssetTestQuery>(
    graphql`
      query NftDetailAssetTestQuery(
        $collectionId: DBID!
        $tokenId: DBID!
        $interactionsFirst: Int!
        $interactionsAfter: String
      ) {
        collectionTokenById(collectionId: $collectionId, tokenId: $tokenId) {
          ... on CollectionToken {
            __typename
            ...NftDetailViewFragment
          }
        }
        ...NftDetailViewQueryFragment
      }
    `,
    { collectionId: 'testCollectionId', tokenId: 'testTokenId', interactionsFirst: NOTES_PER_PAGE }
  );

  if (query.collectionTokenById?.__typename !== 'CollectionToken') {
    throw new Error('Yikes');
  }

  return (
    <NftDetailView
      queryRef={query}
      authenticatedUserOwnsAsset={false}
      collectionTokenRef={query.collectionTokenById}
      visibility="visible"
    />
  );
}

describe('NftDetailAsset', () => {
  it('can render', async () => {
    mockProviderQueries();

    // Mock the query for our Fixture
    mockGraphqlQuery('NftDetailAssetTestQuery', {
      Query() {
        return {
          collectionTokenById: {
            __typename: 'CollectionToken',
          },
        };
      },
      TokenDefinition() {
        return {
          id: 'MyTestToken',
          tokenMetadata: '{}',
          media: {
            __typename: 'UnknownMedia',
            fallbackMedia: null,
            contentRenderURL: 'bad url here',
          },
        };
      },
    });

    // Mock the retry for when they hit the button
    mockGraphqlQuery('NftErrorContextRetryMutation', {
      Mutation() {
        return {
          refreshToken: {
            __typename: 'RefreshTokenPayload',
          },
        };
      },
      TokenDefinition() {
        return {
          id: 'MyTestToken',
          name: 'Test Token Name',
          tokenMetadata: '{}',
          media: {
            __typename: 'ImageMedia',
            fallbackMedia: null,
            contentRenderURL: 'bad url here',
          },
        };
      },
    });

    const { findByText, findByTestId, findByAltText } = render(
      <MockAppProvider>
        <Fixture />
      </MockAppProvider>
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
