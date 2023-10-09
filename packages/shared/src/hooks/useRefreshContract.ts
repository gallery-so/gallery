import { useCallback } from 'react';
import { graphql } from 'relay-runtime';

import { useRefreshContractMutation } from '~/generated/useRefreshContractMutation.graphql';

import { usePromisifiedMutation } from '../relay/usePromisifiedMutation';

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
          ... on ErrInvalidInput {
            __typename
            message
          }
          ... on ErrSyncFailed {
            __typename
            message
          }
        }
      }
    `);

  const refreshContract = useCallback(
    async (contractId: string) => {
      const response = await refreshContractMutate({ variables: { id: contractId } });
      console.log('why nottttttttt', response);
      if (
        response.refreshContract?.__typename === 'ErrInvalidInput' ||
        response.refreshContract?.__typename === 'ErrSyncFailed'
      ) {
        if (response.refreshContract?.message?.includes('context deadline exceeded')) {
          // don't show timeout errors because that means the refresh is still continuing async
          return;
        }
        throw new Error(`Could not refresh token: ${response.refreshContract?.message}`);
      }
    },

    [refreshContractMutate]
  );

  return [refreshContract, isContractRefreshing];
}
