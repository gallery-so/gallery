import { usePromisifiedMutation } from 'hooks/usePromisifiedMutation';
import { useCallback } from 'react';
import { graphql } from 'relay-runtime';
import { useRefreshTokensMutation } from '__generated__/useRefreshTokensMutation.graphql';

// this will be deprecated once we're off opensea
// TODO replace with refreshTokens
export default function useRefreshTokens() {
  const [refreshTokens] = usePromisifiedMutation<useRefreshTokensMutation>(
    graphql`
      mutation useRefreshTokensMutation {
        refreshTokens {
          __typename
        }
      }
    `
  );

  return useCallback(async () => {
    const response = await refreshTokens({
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
  }, [refreshTokens]);
}
