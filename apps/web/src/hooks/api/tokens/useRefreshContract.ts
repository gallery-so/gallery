import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';
import { useRefreshContractMutation } from '~/generated/useRefreshContractMutation.graphql';

import { useCallback } from 'react';
import { graphql } from 'relay-runtime';

export function useRefreshContract(): [(contractId: string) => Promise<void>, boolean] {
  const [refreshContractMutate, isContractRefreshing] =
    usePromisifiedMutation<useRefreshContractMutation>(graphql`
      mutation useRefreshContractMutation($id: DBID!) {
        refreshContract(contractId: $id) {
          ... on RefreshContractPayload {
            __typename
            contract {
              id
            }
          }
        }
      }
    `);

  const refreshContract = useCallback(
    async (contractId: string) => {
      const response = await refreshContractMutate({ variables: { id: contractId } });
      if (
        response.refreshContract?.__typename === 'ErrInvalidInput' ||
        response.refreshContract?.__typename === 'ErrSyncFailed'
      ) {
        if (response.refreshContract?.message?.includes('context deadline exceeded')) {
          // don't show timeout errors because that means the refresh is still continuing async
          return;
        }
        throw new Error(`Could not refresh token: ${response.refreshToken?.message}`);
      }
    },
    [refreshContractMutate]
  );

  return [refreshContract, isContractRefreshing];
}
