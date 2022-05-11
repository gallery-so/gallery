import { usePromisifiedMutation } from 'hooks/usePromisifiedMutation';
import { useCallback } from 'react';
import { graphql } from 'react-relay';
import { useFollowUserMutation } from '__generated__/useFollowUserMutation.graphql';

export default function useFollowUser() {
  const [followUserMutate] = usePromisifiedMutation<useFollowUserMutation>(
    graphql`
      mutation useFollowUserMutation($userId: DBID!) {
        followUser(userId: $userId) {
          __typename

          ... on FollowUserPayload {
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
      await followUserMutate({ variables: { userId: userId } });
    },
    [followUserMutate]
  );
}
