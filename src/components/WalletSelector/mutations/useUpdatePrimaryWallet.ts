import { useCallback } from 'react';
import { graphql } from 'react-relay';

import { useUpdatePrimaryWalletMutation } from '~/generated/useUpdatePrimaryWalletMutation.graphql';
import { usePromisifiedMutation } from '~/hooks/usePromisifiedMutation';

export default function useUpdatePrimaryWallet() {
  const [updatePrimaryWalletAddress] = usePromisifiedMutation<useUpdatePrimaryWalletMutation>(
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

  return useCallback(
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
}
