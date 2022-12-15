import { signMessage } from '@wagmi/core';
import { useCallback } from 'react';
import { graphql } from 'react-relay';
import { SelectorStoreUpdater } from 'relay-runtime';
import { useAccount } from 'wagmi';

import { useToastActions } from '~/contexts/toast/ToastContext';
import { useRedeemMerchMutation } from '~/generated/useRedeemMerchMutation.graphql';
import { usePromisifiedMutation } from '~/hooks/usePromisifiedMutation';

type Props = {
  tokenIds: string[];
  onSuccess: () => void;
};

export default function useRedeemMerch() {
  const { address } = useAccount();

  const [redeemMerch] = usePromisifiedMutation<useRedeemMerchMutation>(graphql`
    mutation useRedeemMerchMutation($input: RedeemMerchInput!) @raw_response_type {
      redeemMerch(input: $input) {
        __typename
        ... on RedeemMerchPayload {
          tokens {
            discountCode
            redeemed
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
    async ({ tokenIds, onSuccess }: Props) => {
      if (!address) return;

      try {
        const signature = await signMessage({
          message: `Gallery uses this cryptographic signature in place of a password: [${tokenIds.join(
            ' '
          )}]`,
        });

        const response = await redeemMerch({
          variables: {
            input: {
              tokenIds,
              address: {
                address: address.toLowerCase(),
                chain: 'Ethereum',
              },
              walletType: 'EOA',
              signature,
            },
          },
        });

        if (response?.redeemMerch?.__typename === 'ErrInvalidInput' || !response?.redeemMerch) {
          pushToast({
            message: 'Failed to redeem merch',
          });
          return;
        }

        pushToast({
          message: 'Successfully redeemed merch',
        });

        onSuccess();
      } catch (error) {
        pushToast({
          message: 'Failed to redeem merch',
        });
      }
    },
    [address, pushToast, redeemMerch]
  );
}
