import { useCallback } from 'react';
import { graphql } from 'relay-runtime';

import { useNftErrorContext } from '~/contexts/NftErrorContext';
import { useToastActions } from '~/contexts/toast/ToastContext';
import { useSyncCreatedTokensForExistingContractMutation } from '~/generated/useSyncCreatedTokensForExistingContractMutation.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';

export function useSyncCreatedTokensForExistingContract(): [
  (contractId: string) => Promise<void>,
  boolean
] {
  const [syncCreatedTokensForExistingContractMutate, isContractRefreshing] =
    usePromisifiedMutation<useSyncCreatedTokensForExistingContractMutation>(graphql`
      mutation useSyncCreatedTokensForExistingContractMutation(
        $input: SyncCreatedTokensForExistingContractInput!
      ) {
        syncCreatedTokensForExistingContract(input: $input) {
          ... on SyncCreatedTokensForExistingContractPayload {
            __typename
            viewer {
              # This should be sufficient to capture all the things
              # we want to refresh. Don't @me when this fails.
              ...GalleryEditorViewerFragment
              # Refresh tokens for post composer
              ...NftSelectorViewerFragment

              ... on Viewer {
                user {
                  tokens(ownershipFilter: [Creator, Holder]) {
                    dbid
                  }
                }
              }
            }
          }
          ... on ErrNotAuthorized {
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

  const { clearTokenFailureState } = useNftErrorContext();
  const { pushToast } = useToastActions();

  const syncCreatedTokensForExistingContract = useCallback(
    async (contractId: string) => {
      pushToast({
        message: 'We’re retrieving your new pieces. This may take up to a few minutes.',
        autoClose: true,
      });

      function showFailure() {
        pushToast({
          autoClose: true,
          message:
            "Something went wrong while syncing your tokens. We're looking into it. Please try again in a few minutes.",
        });
      }

      try {
        const response = await syncCreatedTokensForExistingContractMutate({
          variables: { input: { contractId } },
        });

        console.log('why nottttttttt', response);

        if (
          response.syncCreatedTokensForExistingContract?.__typename !==
          'SyncCreatedTokensForExistingContractPayload'
        ) {
          console.log('error, response: ', response.syncCreatedTokensForExistingContract);
          showFailure();
        } else {
          const tokenIds = removeNullValues(
            response.syncCreatedTokensForExistingContract.viewer?.user?.tokens?.map((token) => {
              return token?.dbid;
            })
          );

          clearTokenFailureState(tokenIds);
        }
      } catch (error) {
        console.log('error caught', error);
        showFailure();
      }
    },

    [syncCreatedTokensForExistingContractMutate, clearTokenFailureState, pushToast]
  );

  return [syncCreatedTokensForExistingContract, isContractRefreshing];
}
