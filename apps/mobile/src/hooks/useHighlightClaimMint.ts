import { useCallback } from 'react';
import { graphql } from 'react-relay';
import { SelectorStoreUpdater } from 'relay-runtime';
import { useReportError } from 'shared/contexts/ErrorReportingContext';
import { usePromisifiedMutation } from 'shared/relay/usePromisifiedMutation';

import { useHighlightClaimMintMutation } from '~/generated/useHighlightClaimMintMutation.graphql';

export function useHighlightClaimMint() {
  const [claimMint, isClamingMint] = usePromisifiedMutation<useHighlightClaimMintMutation>(graphql`
    mutation useHighlightClaimMintMutation($input: HighlightClaimMintInput!) {
      highlightClaimMint(input: $input) {
        ... on HighlightClaimMintPayload {
          __typename
          claimId
        }
        ... on ErrHighlightTxnFailed {
          __typename
        }
        ... on ErrHighlightMintUnavailable {
          __typename
        }
        ... on ErrHighlightChainNotSupported {
          __typename
        }
      }
    }
  `);

  const reportError = useReportError();

  const handleClaimMint = useCallback(
    async ({
      collectionId,
      recipientWalletId,
    }: {
      collectionId: string;
      recipientWalletId: string;
    }) => {
      const updater: SelectorStoreUpdater<useHighlightClaimMintMutation['response']> = (
        store,
        response
      ) => {
        if (response.highlightClaimMint?.__typename === 'HighlightClaimMintPayload') {
          // do nothing
        }
      };
      console.log({
        collectionId,
        recipientWalletId,
      });
      try {
        const response = await claimMint({
          // updater,
          variables: {
            input: {
              collectionId,
              recipientWalletId,
            },
          },
        });

        console.log({ response });

        if (response.highlightClaimMint?.__typename !== 'HighlightClaimMintPayload') {
          // do nothing
          reportError(
            `Error while claiming mint, typename was ${response.highlightClaimMint?.__typename}`
          );
        }

        return response.highlightClaimMint?.claimId;
      } catch (error) {
        console.log({ error });
        if (error instanceof Error) {
          reportError(error);
        } else {
          reportError('Error while claiming mint');
        }
      }
    },
    [claimMint, reportError]
  );
  return {
    claimMint: handleClaimMint,
    isClamingMint,
  };
}
