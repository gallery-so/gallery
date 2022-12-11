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
          message
        }
      }
    }
  `);

  const { pushToast } = useToastActions();

  return useCallback(
    async (tokenIds: string[]) => {
      try {
        const signature = await signMessage({
          message: `Gallery uses this that you own the following merch token IDs: ${tokenIds.join(
            ', '
          )}`,
        });

        const response = await redeemMerch({
          variables: {
            input: {
              tokenIds,
              address: {
                address: (address as string).toLowerCase(),
                chain: 'Ethereum',
              },
              walletType: 'EOA',
              signature,
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
