import { usePromisifiedMutation } from 'hooks/usePromisifiedMutation';
import { useCallback } from 'react';
import { graphql } from 'relay-runtime';
import {
  useAddWalletMutation,
  useAddWalletMutation$variables,
} from '__generated__/useAddWalletMutation.graphql';

export default function useAddWallet() {
  const [addWallet] = usePromisifiedMutation<useAddWalletMutation>(
    graphql`
      mutation useAddWalletMutation($address: Address!, $authMechanism: AuthMechanism!) {
        addUserAddress(address: $address, authMechanism: $authMechanism) {
          ... on AddUserAddressPayload {
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
    async ({ authMechanism, address }: useAddWalletMutation$variables) => {
      const { addUserAddress } = await addWallet({
        variables: {
          address,
          authMechanism,
        },
      });

      if (addUserAddress?.__typename === 'AddUserAddressPayload') {
        return { signatureValid: true };
      } else {
        // TODO(Terence): We can probably have better error handling here.

        return { signatureValid: false };
      }
    },
    [addWallet]
  );
}
