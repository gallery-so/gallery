import { usePromisifiedMutation } from 'hooks/usePromisifiedMutation';
import { useCallback } from 'react';
import { graphql } from 'relay-runtime';
import { useSyncTokensMutation } from '__generated__/useSyncTokensMutation.graphql';

export default function useSyncTokens() {
  const [syncTokens] = usePromisifiedMutation<useSyncTokensMutation>(
    graphql`
      mutation useSyncTokensMutation {
        syncTokens {
          __typename
          ... on SyncTokensPayload {
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
    const response = await syncTokens({
      variables: {},
    });

    if (response.syncTokens?.__typename === 'ErrOpenSeaRefreshFailed') {
      throw new Error(
        'Error while fetching latest NFTs. Opensea may be temporarily unavailable. Please try again later.'
      );
    }
    // TODO: log the user out
    if (response.syncTokens?.__typename === 'ErrNotAuthorized') {
      throw new Error('You are not authorized!');
    }
  }, [syncTokens]);
}
