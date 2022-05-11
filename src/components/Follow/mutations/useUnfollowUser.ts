import { usePromisifiedMutation } from 'hooks/usePromisifiedMutation';
import { useCallback } from 'react';
import { graphql } from 'react-relay';
import { useUnfollowUserMutation } from '__generated__/useUnfollowUserMutation.graphql';

export default function useUnfollowUser() {
  const [unfollowUserMutate] = usePromisifiedMutation<useUnfollowUserMutation>(
    graphql`
      mutation useUnfollowUserMutation($userId: DBID!) {
        unfollowUser(userId: $userId) {
          __typename

          ... on UnfollowUserPayload {
            user @required(action: THROW) {
              __typename
              id
              followers {
                id
              }
              following {
                id
              }
            }
          }
          ... on ErrUserNotFound {
            message
          }
          ... on ErrAuthenticationFailed {
            message
          }
          ... on ErrInvalidInput {
            message
          }
        }
      }
    `
  );

  return useCallback(
    async (userId: string) => {
      await unfollowUserMutate({ variables: { userId: userId } });
    },
    [unfollowUserMutate]
  );
}
