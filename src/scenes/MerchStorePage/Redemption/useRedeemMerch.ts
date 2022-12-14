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
      try {
        const signature = await signMessage({
          message: `Gallery uses this cryptographic signature in place of a password: [${tokenIds.join(
            ', '
          )}]`,
        });

        // TODO: Remove this once we fix the issue with the id
        const updater: SelectorStoreUpdater<useRedeemMerchMutation['response']> = (
          store,
          response
        ) => {
          if (response?.redeemMerch?.__typename === 'RedeemMerchPayload') {
            const merchTokens = response?.redeemMerch?.tokens || [];

            const root = store.get(`client:root:getMerchTokens(wallet:"${address}")`);

            const tokens = root?.getLinkedRecords('tokens') || [];

            // assign the discount code to the token
            tokens.forEach((token) => {
              const tokenId = token.getValue('tokenId');
              const selectedMerchToken = merchTokens.find(
                (merchToken) => merchToken?.tokenId === tokenId
              );

              if (selectedMerchToken) {
                token
                  .setValue(selectedMerchToken.discountCode, 'discountCode')
                  .setValue(true, 'redeemed');
              }
            });
          }
        };

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
          updater,
        });

        if (response?.redeemMerch?.__typename === 'ErrInvalidInput') {
          pushToast({
            message: 'Something went wrong',
          });
          return;
        }

        if (
          response?.redeemMerch?.__typename === 'RedeemMerchPayload' &&
          response?.redeemMerch?.tokens?.length === 0
        ) {
          pushToast({
            message: 'Something went wrong',
          });
          return;
        }

        pushToast({
          message: 'Successfully redeemed merch',
        });

        onSuccess();
      } catch (error) {
        pushToast({
          message: 'Something went wrong',
        });
      }
    },
    [address, pushToast, redeemMerch]
  );
}
