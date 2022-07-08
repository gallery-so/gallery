import { useCallback } from 'react';
import { usePromisifiedMutation } from 'hooks/usePromisifiedMutation';
import { graphql } from 'relay-runtime';
import { useRefreshTokenMutation } from '__generated__/useRefreshTokenMutation.graphql';

export function useRefreshToken() {
  const [refreshTokenMutate] = usePromisifiedMutation<useRefreshTokenMutation>(graphql`
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
        ... on ErrOpenSeaRefreshFailed {
          __typename
          message
        }
      }
    }
  `);

  return useCallback(
    async (tokenId: string) => {
      const response = await refreshTokenMutate({ variables: { id: tokenId } });
      if (
        response.refreshToken?.__typename === 'ErrInvalidInput' ||
        response.refreshToken?.__typename === 'ErrOpenSeaRefreshFailed'
      ) {
        throw new Error(`Could not refresh token: ${response.refreshToken?.message}`);
      }
    },
    [refreshTokenMutate]
  );
}
