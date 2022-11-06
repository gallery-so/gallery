import { useCallback } from 'react';
import { graphql } from 'relay-runtime';

import { useRemoveWalletMutation } from '~/generated/useRemoveWalletMutation.graphql';
import { usePromisifiedMutation } from '~/hooks/usePromisifiedMutation';

export default function useRemoveWallet() {
  const [removeWallet] = usePromisifiedMutation<useRemoveWalletMutation>(
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

  return useCallback(
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
}
