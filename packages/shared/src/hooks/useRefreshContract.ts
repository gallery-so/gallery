import { useCallback } from 'react';
import { graphql } from 'relay-runtime';

import { useRefreshContractMutation } from '~/generated/useRefreshContractMutation.graphql';

import { useReportError } from '../contexts/ErrorReportingContext';
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
        }
      }
    `);

  const reportError = useReportError();

  const refreshContract = useCallback(
    async (contractId: string) => {
      try {
        await refreshContractMutate({ variables: { id: contractId } });
      } catch (error: unknown) {
        if (error instanceof Error) {
          reportError(error, {
            tags: {
              contractId: contractId,
            },
          });
        } else {
          reportError('Error while refreshing collection, unknown error');
        }
      }
    },
    [refreshContractMutate, reportError]
  );

  return [refreshContract, isContractRefreshing];
}
