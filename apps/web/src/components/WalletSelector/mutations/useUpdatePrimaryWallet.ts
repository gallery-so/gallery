import { useCallback } from 'react';
import { graphql } from 'react-relay';

import { useUpdatePrimaryWalletMutation } from '~/generated/useUpdatePrimaryWalletMutation.graphql';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';

export default function useUpdatePrimaryWallet() {
  const [updatePrimaryWalletAddress, isMutating] =
    usePromisifiedMutation<useUpdatePrimaryWalletMutation>(
      graphql`
        mutation useUpdatePrimaryWalletMutation($walletId: DBID!) {
          updatePrimaryWallet(walletID: $walletId) {
            ... on UpdatePrimaryWalletPayload {
              __typename
              viewer {
                user {
                  primaryWallet {
                    dbid
                  }
                }
              }
            }
          }
        }
      `
    );

  const mutate = useCallback(
    async (walletId: string) => {
      const { updatePrimaryWallet } = await updatePrimaryWalletAddress({
        variables: {
          walletId: walletId,
        },
      });

      if (updatePrimaryWallet?.__typename === 'UpdatePrimaryWalletPayload') {
        return;
      } else {
        throw new Error('Error updating primary wallet');
      }
    },
    [updatePrimaryWalletAddress]
  );

  return [mutate, isMutating] as const;
}
