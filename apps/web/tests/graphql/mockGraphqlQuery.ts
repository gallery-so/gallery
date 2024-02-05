import { addMocksToSchema, IMocks } from '@graphql-tools/mock';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { readFileSync } from 'fs';
import { graphql, Source } from 'graphql';
import nock from 'nock';

import { getGraphqlHost, getGraphqlPath } from '~/contexts/relay/network';
import { Chain } from '~/tests/__generated__/graphql-codegen/operations';

import persistedQueries from '../../persisted_queries.json';

const defaultMocks = {
  DBID: () => {
    return Math.random().toString();
  },
  Address: () => {
    // return a fake eth address
    return '0x29D7d1dd5B6f9C864d9db560D72a247c178aE86B';
  },
  Email: () => {
    return 'someemail@email.com';
  },
  Time: () => {
    return '2021-08-01T00:00:00Z';
  },
  TokenId: () => {
    return '1444991063';
  },
  PreviewURLSet: () => {
    return {
      raw: 'https://someurl.com',
      thumbnail: 'https://someurl.com',
      small: 'https://someurl.com',
      medium: 'https://someurl.com',
      large: 'https://someurl.com',
      srcSet: 'https://someurl.com',
      liveRender: 'https://someurl.com',
      blurhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
    };
  },
  Query: {
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
  },
};

/**
 * Read more about this pattern [here](https://the-guild.dev/graphql/tools/docs/mocking)
 */
const schemaString = readFileSync('../../schema.graphql', 'utf8');
const schema = makeExecutableSchema({ typeDefs: schemaString });

export function mockGraphqlQuery(operationName: string, mockOverrides: IMocks) {
  return nock(getGraphqlHost())
    .post(getGraphqlPath(operationName), (body) => body.operationName === operationName)
    .reply(200, (_, body) => {
      body = body as Source;
      const queryHash = body.extensions.persistedQuery.sha256Hash;

      // @ts-expect-error persistedQueries is a json object
      const queryText = persistedQueries[queryHash];

      const schemaWithMocks = addMocksToSchema({
        schema,
        mocks: {
          ...defaultMocks,
          ...mockOverrides,
        },
      });

      return graphql({
        schema: schemaWithMocks,
        source: queryText,
        variableValues: body.variables,
      });
    });
}
