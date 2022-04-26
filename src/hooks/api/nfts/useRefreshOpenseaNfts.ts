import { usePromisifiedMutation } from 'hooks/usePromisifiedMutation';
import { useCallback } from 'react';
import { graphql } from 'relay-runtime';
import { useRefreshOpenseaNftsMutation } from '__generated__/useRefreshOpenseaNftsMutation.graphql';

// this will be deprecated once we're off opensea
export default function useRefreshOpenseaNfts() {
  const [refreshOpenseaNfts] = usePromisifiedMutation<useRefreshOpenseaNftsMutation>(
    graphql`
      mutation useRefreshOpenseaNftsMutation($addresses: String) {
        refreshOpenSeaNfts(addresses: $addresses) {
          __typename
        }
      }
    `
  );

  return useCallback(async () => {
    const response = await refreshOpenseaNfts({
      variables: {},
    });

    if (response.refreshOpenSeaNfts?.__typename === 'ErrOpenSeaRefreshFailed') {
      throw new Error(
        'Error while fetching latest NFTs. Opensea may be temporarily unavailable. Please try again later.'
      );
    }
    // TODO: log the user out
    if (response.refreshOpenSeaNfts?.__typename === 'ErrNotAuthorized') {
      throw new Error('You are not authorized!');
    }
  }, [refreshOpenseaNfts]);
}
