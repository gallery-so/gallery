import { useCallback } from 'react';
import { graphql } from 'relay-runtime';

import { useUnblockUserMutation } from '~/generated/useUnblockUserMutation.graphql';

import { usePromisifiedMutation } from '../relay/usePromisifiedMutation';

export function useUnblockUser() {
  const [unblockUser] = usePromisifiedMutation<useUnblockUserMutation>(
    graphql`
      mutation useUnblockUserMutation($userId: DBID!) {
        unblockUser(userId: $userId) {
          __typename
          ... on UnblockUserPayload {
            userId
          }
        }
      }
    `
  );

  return useCallback(
    async (userId: string) => {
      const { unblockUser: response } = await unblockUser({
        variables: {
          userId,
        },
      });

      if (response?.__typename === 'UnblockUserPayload') {
        return response.userId;
      }

      throw new Error('Failed to unblock user');
    },
    [unblockUser]
  );
}
