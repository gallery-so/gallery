import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';
import { useRefreshContractMutation } from '~/generated/useRefreshContractMutation.graphql';
import { useToastActions } from '~/contexts/toast/ToastContext';
import { useReportError } from '~/shared/contexts/ErrorReportingContext';

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

  const reportError = useReportError();
  const { pushToast } = useToastActions();

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

          pushToast({
            message: error.message,
            autoClose: true,
          });
        } else {
          reportError('Error while refreshing collection, unknown error');

          pushToast({
            message: "Something went wrong, we're looking into it now.",
          });
        }
      }
    },
    [pushToast, refreshContractMutate, reportError]
  );

  return [refreshContract, isContractRefreshing];
}
