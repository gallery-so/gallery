import { usePromisifiedMutation } from 'hooks/usePromisifiedMutation';
import { useCallback } from 'react';
import { graphql } from 'relay-runtime';

export default function useRemoveWallet() {
  const [removeWallet] = usePromisifiedMutation<any>(
    graphql`
      mutation useRemoveWalletMutation($addresses: [Address!]!) {
        removeUserAddresses(addresses: $addresses) {
          ... on RemoveUserAddressesPayload {
            __typename
            viewer {
              user {
                wallets {
                  address
                }
              }
            }
          }
        }
      }
    `
  );

  return useCallback(
    async (address: string) => {
      const { removeUserAddresses } = await removeWallet({
        variables: {
          addresses: [address],
        },
      });

      if (removeUserAddresses?.__typename === 'RemoveUserAddressesPayload') {
        return;
      } else {
        // TODO: handle error here
        return;
      }
    },
    [removeWallet]
  );
}
