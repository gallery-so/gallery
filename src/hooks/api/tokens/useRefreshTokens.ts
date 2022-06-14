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
          ... on RefreshTokensPayload {
            viewer {
              user {
                tokens {
                  dbid @required(action: THROW)
                  name @required(action: THROW)
                  lastUpdated @required(action: THROW)
                  ...SidebarFragment
                  ...StagingAreaFragment
                }
              }
            }
          }
          ... on ErrNotAuthorized {
            message
          }
          ... on ErrOpenSeaRefreshFailed {
            message
          }
        }
      }
    `
  );

  return useCallback(async () => {
    const response = await refreshTokens({
      variables: {},
    });

    if (response.refreshTokens?.__typename === 'ErrOpenSeaRefreshFailed') {
      throw new Error(
        'Error while fetching latest NFTs. Opensea may be temporarily unavailable. Please try again later.'
      );
    }
    // TODO: log the user out
    if (response.refreshTokens?.__typename === 'ErrNotAuthorized') {
      throw new Error('You are not authorized!');
    }
  }, [refreshTokens]);
}
