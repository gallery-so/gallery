import { signMessage } from '@wagmi/core';
import { useCallback } from 'react';
import { graphql } from 'react-relay';
import { useAccount } from 'wagmi';

import { useToastActions } from '~/contexts/toast/ToastContext';
import { useRedeemMerchMutation } from '~/generated/useRedeemMerchMutation.graphql';
import { usePromisifiedMutation } from '~/hooks/usePromisifiedMutation';

export default function useRedeemMerch() {
  const { address } = useAccount();

  const [redeemMerch] = usePromisifiedMutation<useRedeemMerchMutation>(graphql`
    mutation useRedeemMerchMutation($input: RedeemMerchInput!) @raw_response_type {
      redeemMerch(input: $input) {
        __typename
        ... on RedeemMerchPayload {
          discountCodes {
            code
            tokenId
          }
        }
        ... on ErrInvalidInput {
          __typename
        }
      }
    }
  `);

  const { pushToast } = useToastActions();

  return useCallback(
    async (tokenIds: string[]) => {
      // generate signature
      const signature = await signMessage({
        message: `Gallery uses this that you own the following merch token IDs: ${tokenIds.join(
          ', '
        )}`,
      });

      const payload = {
        tokenIds,
        address: {
          address,
          chain: 'Ethereum',
        },
        // TODO: get wallet type from account
        walletType: 'EOA',
        signature,
      };

      console.log(payload);

      return;
      try {
        const response = await redeemMerch({
          variables: {
            input: {
              tokenIds,
              address: {
                address: '0x123',
                chain: 'Ethereum',
              },
              walletType: 'EOA',
              signature: '0x123',
            },
          },
        });

        if (response?.redeemMerch?.__typename === 'ErrInvalidInput') {
          pushToast({
            message: 'Something went wrong',
            autoClose: false,
          });
          return;
        }

        pushToast({
          message: 'Successfully redeemed merch',
          autoClose: false,
        });
      } catch (error) {
        pushToast({
          message: 'Something went wrong',
          autoClose: false,
        });
      }
    },
    [address, pushToast, redeemMerch]
  );
}
