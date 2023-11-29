import { useCallback } from 'react';
import { graphql } from 'relay-runtime';

import { useBlockUserMutation } from '~/generated/useBlockUserMutation.graphql';

import { usePromisifiedMutation } from '../relay/usePromisifiedMutation';

export function useBlockUser() {
  const [blockUser] = usePromisifiedMutation<useBlockUserMutation>(
    graphql`
      mutation useBlockUserMutation($userId: DBID!) {
        blockUser(userId: $userId) {
          __typename
          ... on BlockUserPayload {
            userId
          }
        }
      }
    `
  );

  return useCallback(
    async (userId: string) => {
      const { blockUser: response } = await blockUser({
        variables: {
          userId,
        },
      });

      if (response?.__typename === 'BlockUserPayload') {
        return response.userId;
      }

      throw new Error('Failed to block user');
    },
    [blockUser]
  );
}
