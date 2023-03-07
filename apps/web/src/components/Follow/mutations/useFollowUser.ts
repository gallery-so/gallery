import { useCallback } from 'react';
import { graphql } from 'react-relay';

import { FollowButtonQueryFragment$data } from '~/generated/FollowButtonQueryFragment.graphql';
import {
  useFollowUserMutation,
  useFollowUserMutation$data,
} from '~/generated/useFollowUserMutation.graphql';
import { usePromisifiedMutation } from '~/hooks/usePromisifiedMutation';

export default function useFollowUser() {
  const [followUserMutate] = usePromisifiedMutation<useFollowUserMutation>(
    graphql`
      mutation useFollowUserMutation($userId: DBID!) {
        followUser(userId: $userId) {
          __typename

          ... on FollowUserPayload {
            viewer {
              __typename
              user {
                __typename
                id
                following {
                  id
                }
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
      loggedInUserId: string,
      followeeId: string,
      // optimistic list of users followed by logged in user
      followingIds: FollowButtonQueryFragment$data['viewer']['user']['following']
    ) => {
      const optimisticResponse: useFollowUserMutation$data = {
        followUser: {
          __typename: 'FollowUserPayload',
          viewer: {
            __typename: 'Viewer',
            user: {
              __typename: 'GalleryUser',
              id: `GalleryUser:${loggedInUserId}`,
              following: followingIds,
            },
          },
        },
      };
      await followUserMutate({ optimisticResponse, variables: { userId: followeeId } });
    },
    [followUserMutate]
  );
}
