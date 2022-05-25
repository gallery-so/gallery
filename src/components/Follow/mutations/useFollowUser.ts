import { usePromisifiedMutation } from 'hooks/usePromisifiedMutation';
import { useCallback } from 'react';
import { graphql } from 'react-relay';
import { FollowButtonFragment$data } from '__generated__/FollowButtonFragment.graphql';
import {
  useFollowUserMutation,
  useFollowUserMutation$data,
} from '__generated__/useFollowUserMutation.graphql';

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
    async (
      userId: string,
      followerIds: FollowButtonFragment$data['followers'],
      followingIds: FollowButtonFragment$data['following']
    ) => {
      const optimisticResponse: useFollowUserMutation$data = {
        followUser: {
          __typename: 'FollowUserPayload',
          user: {
            __typename: 'GalleryUser',
            id: `GalleryUser:${userId}`,
            followers: followerIds,
            following: followingIds,
          },
        },
      };
      await followUserMutate({ optimisticResponse, variables: { userId: userId } });
    },
    [followUserMutate]
  );
}
