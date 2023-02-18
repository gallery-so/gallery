import { useCallback } from 'react';
import { graphql } from 'relay-runtime';

import { useRemoveWalletMutation } from '~/generated/useRemoveWalletMutation.graphql';
import { usePromisifiedMutation } from '~/shared/hooks/usePromisifiedMutation';

export default function useRemoveWallet() {
  const [removeWallet, isMutating] = usePromisifiedMutation<useRemoveWalletMutation>(
    graphql`
      mutation useRemoveWalletMutation($walletIds: [DBID!]!) {
        removeUserWallets(walletIds: $walletIds) {
          ... on RemoveUserWalletsPayload {
            __typename
            viewer {
              user {
                wallets {
                  chainAddress {
                    address
                  }
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
      const { removeUserWallets } = await removeWallet({
        variables: {
          walletIds: [walletId],
        },
      });

      if (removeUserWallets?.__typename === 'RemoveUserWalletsPayload') {
        return;
      } else {
        // TODO: handle error here
        return;
      }
    },
    [removeWallet]
  );

  return [mutate, isMutating] as const;
}
