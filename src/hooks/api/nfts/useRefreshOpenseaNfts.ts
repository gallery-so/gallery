import { usePromisifiedMutation } from 'hooks/usePromisifiedMutation';
import { useCallback } from 'react';
import { graphql } from 'relay-runtime';

// this will be deprecated once we're off opensea
export default function useRefreshOpenseaNfts() {
  const [refreshOpenseaNfts] = usePromisifiedMutation(
    graphql`
      mutation useRefreshOpenseaNftsMutation($addresses: String) {
        refreshOpenSeaNfts(addresses: $addresses) {
          __typename
        }
      }
    `
  );

  return useCallback(async () => {
    await refreshOpenseaNfts({ variables: {} });
  }, [refreshOpenseaNfts]);
}
