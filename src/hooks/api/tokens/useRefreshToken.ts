import { useCallback } from 'react';
import { usePromisifiedMutation } from 'hooks/usePromisifiedMutation';
import { graphql } from 'relay-runtime';
import { useRefreshTokenMutation } from '__generated__/useRefreshTokenMutation.graphql';

export function useRefreshToken() {
  const [refreshTokenMutate] = usePromisifiedMutation<useRefreshTokenMutation>(graphql`
    mutation useRefreshTokenMutation($id: DBID!) {
      refreshToken(tokenId: $id) {
        ... on RefreshTokenPayload {
          token {
            id
          }
        }
      }
    }
  `);

  return useCallback(
    async (tokenId: string) => {
      await refreshTokenMutate({ variables: { id: tokenId } });
    },
    [refreshTokenMutate]
  );
}
