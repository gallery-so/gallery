import { useCallback } from 'react';
import { useRelayEnvironment } from 'react-relay';
import { fetchQuery, graphql } from 'relay-runtime';

import {
  ChainAddressInput,
  useGetUserByWalletAddressQuery,
} from '~/generated/useGetUserByWalletAddressQuery.graphql';

/**
 * @returns an imperative fetcher to get a gallery user by wallet address.
 * if one exists, a DBID will be returned; otherwise will return null
 */
export function useGetUserByWalletAddressImperatively() {
  const environment = useRelayEnvironment();

  return useCallback(
    async (chainAddress: ChainAddressInput): Promise<string | null> => {
      const query = await fetchQuery<useGetUserByWalletAddressQuery>(
        environment,
        graphql`
          query useGetUserByWalletAddressQuery($chainAddress: ChainAddressInput!) {
            userByAddress(chainAddress: $chainAddress) {
              __typename
              ... on GalleryUser {
                dbid
              }
            }
          }
        `,
        { chainAddress },
        { fetchPolicy: 'network-only' }
      ).toPromise();

      if (query?.userByAddress?.__typename === 'GalleryUser') {
        return query.userByAddress.dbid;
      }
      return null;
    },
    [environment]
  );
}
