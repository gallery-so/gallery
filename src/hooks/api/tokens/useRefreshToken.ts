import { useCallback } from 'react';
import { usePromisifiedMutation } from 'hooks/usePromisifiedMutation';
import { graphql } from 'relay-runtime';
import { useRefreshTokenMutation } from '__generated__/useRefreshTokenMutation.graphql';

export function useRefreshToken(): [(tokenId: string) => Promise<void>, boolean] {
  const [refreshTokenMutate, isRefreshing] =
    usePromisifiedMutation<useRefreshTokenMutation>(graphql`
      mutation useRefreshTokenMutation($id: DBID!) {
        refreshToken(tokenId: $id) {
          ... on RefreshTokenPayload {
            __typename
            token {
              id
            }
          }
          ... on ErrInvalidInput {
            __typename
            message
          }
          ... on ErrSyncFailed {
            __typename
            message
          }
        }
      }
    `);

  const refreshToken = useCallback(
    async (tokenId: string) => {
      const response = await refreshTokenMutate({ variables: { id: tokenId } });
      if (
        response.refreshToken?.__typename === 'ErrInvalidInput' ||
        response.refreshToken?.__typename === 'ErrSyncFailed'
      ) {
        if (response.refreshToken?.message?.includes('context deadline exceeded')) {
          // don't show timeout errors because that means the refresh is still continuing async
          return;
        }
        throw new Error(`Could not refresh token: ${response.refreshToken?.message}`);
      }
    },
    [refreshTokenMutate]
  );

  return [refreshToken, isRefreshing];
}
