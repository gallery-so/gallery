import { useCallback } from 'react';
import { graphql } from 'react-relay';

import { FollowButtonUserFragment$data } from '~/generated/FollowButtonUserFragment.graphql';
import {
  useUnfollowUserMutation,
  useUnfollowUserMutation$data,
} from '~/generated/useUnfollowUserMutation.graphql';
import { usePromisifiedMutation } from '~/shared/hooks/usePromisifiedMutation';

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
    async (
      userId: string,
      followerIds: FollowButtonUserFragment$data['followers'],
      followingIds: FollowButtonUserFragment$data['following']
    ) => {
      const optimisticResponse: useUnfollowUserMutation$data = {
        unfollowUser: {
          __typename: 'UnfollowUserPayload',
          user: {
            __typename: 'GalleryUser',
            id: `GalleryUser:${userId}`,
            followers: followerIds,
            following: followingIds,
          },
        },
      };
      await unfollowUserMutate({ optimisticResponse, variables: { userId: userId } });
    },
    [unfollowUserMutate]
  );
}
