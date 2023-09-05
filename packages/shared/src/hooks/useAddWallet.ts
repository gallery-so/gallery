import { useCallback } from 'react';
import { graphql } from 'relay-runtime';

import {
  useAddWalletMutation,
  useAddWalletMutation$variables,
} from '~/generated/useAddWalletMutation.graphql';

import { usePromisifiedMutation } from '../relay/usePromisifiedMutation';

export default function useAddWallet() {
  const [addWallet] = usePromisifiedMutation<useAddWalletMutation>(
    graphql`
      mutation useAddWalletMutation(
        $chainAddress: ChainAddressInput!
        $authMechanism: AuthMechanism!
      ) {
        addUserWallet(chainAddress: $chainAddress, authMechanism: $authMechanism) {
          ... on AddUserWalletPayload {
            __typename
            viewer {
              user {
                wallets {
                  dbid
                  chainAddress {
                    address
                    chain
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
    async ({ authMechanism, chainAddress }: useAddWalletMutation$variables) => {
      const { addUserWallet } = await addWallet({
        variables: {
          chainAddress,
          authMechanism,
        },
      });

      if (addUserWallet?.__typename === 'AddUserWalletPayload') {
        return { signatureValid: true };
      } else {
        // TODO(Terence): We can probably have better error handling here.

        return { signatureValid: false };
      }
    },
    [addWallet]
  );
}
