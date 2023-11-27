import { fireEvent, render } from '@testing-library/react';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { NOTES_PER_PAGE } from '~/components/Feed/Socialize/CommentsModal/CommentsModal';
import { NftDetailAssetTestQuery } from '~/generated/NftDetailAssetTestQuery.graphql';
import NftDetailView from '~/scenes/NftDetailPage/NftDetailView';
import {
  Chain,
  NftDetailAssetTestQueryQuery,
  NftErrorContextRetryMutationMutation,
} from '~/tests/__generated__/graphql-codegen/operations';
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
      __typename: 'Token',
      id: 'Token:testTokenId',
      dbid: 'testTokenId',
      chain: Chain.Ethereum,
      tokenMetadata: '{}',
      lastUpdated: '2023-07-25T11:47:41.83653Z',
      ownerIsCreator: false,
      owner: {
        dbid: 'testOwnerId',
        id: 'GalleryUser:TestOwnerId',
        username: 'Test Username',
        universal: false,
        primaryWallet: {
          id: 'Wallet:testWalletId',
          chainAddress: {
            address: '2',
            chain: Chain.Ethereum,
          },
        },
        profileImage: {
          token: {
            dbid: 'testTokenId',
            id: 'Token:testTokenId',
            media: {
              __typename: 'ImageMedia',
              previewURLs: {
                small: 'http://someurl.com',
                medium: 'http://someurl.com',
                large: 'http://someurl.com',
              },
              fallbackMedia: {
                mediaURL: 'http://someurl.com',
              },
            },
          },
        },
      },
      name: 'Test Token Name',
      description: 'Test Description',
      tokenId: '1',
      externalUrl: 'http://someurl.com',
      collectorsNote: 'Test Collectors Note',
      media: {
        __typename: 'UnknownMedia',
        fallbackMedia: null,
        contentRenderURL: 'bad url here',
      },
      contract: {
        __typename: 'Contract',
        id: 'Contract:someContractId',
        name: 'Test Contract Name',
        chain: Chain.Ethereum,
        contractAddress: {
          address: '0x0Ff979fB365e20c09bE06676D569EF581a46621D',
        },
        badgeURL: 'http://someurl.com',
      },
      community: {
        __typename: 'Community',
        id: 'Contract:someCommunityId',
        contractAddress: {
          chain: Chain.Ethereum,
          address: '0x0Ff979fB365e20c09bE06676D569EF581a46621D',
        },
        // @ts-expect-error creator can be either GalleryUser or ChainAddress, not sure
        // how to satisfy __typename here
        creator: {
          // __typename: 'GalleryUserOrAddress',
          username: 'Test Username',
          universal: false,
          primaryWallet: {
            id: 'Wallet:testWalletId',
            chainAddress: {
              address: '2',
              chain: Chain.Ethereum,
            },
          },
          address: '2',
          chain: Chain.Ethereum,
        },
      },
      viewerAdmire: {
        dbid: 'testAdmireId',
        __typename: 'Admire',
        id: 'Admire:someAdmireId',
      },
      admires: {
        edges: [
          {
            node: {
              __typename: 'Admire',
              id: 'Admire:someAdmireId',
              admirer: {
                dbid: 'testOwnerId',
                id: 'GalleryUser:TestOwnerId',
                username: 'Test Username',
                profileImage: {
                  token: {
                    dbid: 'testTokenId',
                    id: 'Token:testTokenId',
                    media: {
                      __typename: 'ImageMedia',
                      previewURLs: {
                        small: 'http://someurl.com',
                        medium: 'http://someurl.com',
                        large: 'http://someurl.com',
                      },
                      fallbackMedia: {
                        mediaURL: 'http://someurl.com',
                      },
                    },
                  },
                },
              },
            },
          },
        ],
      },
      previewAdmires: {
        edges: [
          {
            node: {
              __typename: 'Admire',
              id: 'Admire:someAdmireId',
              admirer: {
                __typename: 'GalleryUser',
                dbid: 'testOwnerId',
                id: 'GalleryUser:TestOwnerId',
                username: 'Test Username',
                profileImage: {
                  __typename: 'TokenProfileImage',
                  token: {
                    dbid: 'testTokenId',
                    id: 'Token:testTokenId',
                    media: {
                      __typename: 'ImageMedia',
                      previewURLs: {
                        small: 'http://someurl.com',
                        medium: 'http://someurl.com',
                        large: 'http://someurl.com',
                      },
                      fallbackMedia: {
                        mediaURL: 'http://someurl.com',
                      },
                    },
                  },
                },
              },
            },
          },
        ],
        pageInfo: {
          total: 1,
        },
      },
    },
  },
  viewer: {
    __typename: 'Viewer',
    id: 'Viewer:id',
    user: {
      __typename: 'GalleryUser',
      dbid: 'testOwnerId',
      id: 'GalleryUser:TestOwnerId',
      username: 'Test Username',
      profileImage: {
        __typename: 'EnsProfileImage',
      },
      wallets: [],
      following: [],
      primaryWallet: {
        id: 'Token:testWalletId',
        dbid: 'testWalletId',
        chainAddress: {
          __typename: 'ChainAddress',
          chain: Chain.Ethereum,
          address: 'someAddress',
        },
      },
      followers: [],
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
      tokenId: 'testTokenId',
      dbid: 'testTokenId',
      name: 'Test Token Name',
      chain: Chain.Ethereum,
      media: {
        __typename: 'ImageMedia',
        fallbackMedia: null,
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
      owner: {
        id: 'testOwnerId',
        username: 'Test Username',
      },
    },
  },
};

describe.skip('NftDetailAsset', () => {
  it('can render', async () => {
    mockProviderQueries();

    // Mock the query for our Fixture
    mockGraphqlQuery('NftDetailAssetTestQuery', UnknownMediaResponse);

    // Mock the retry for when they hit the button
    mockGraphqlQuery('NftErrorContextRetryMutation', RetryImageMediaResponse);

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
