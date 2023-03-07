import { useCallback } from 'react';
import { graphql } from 'react-relay';

import { FollowButtonQueryFragment$data } from '~/generated/FollowButtonQueryFragment.graphql';
import {
  useUnfollowUserMutation,
  useUnfollowUserMutation$data,
} from '~/generated/useUnfollowUserMutation.graphql';
import { usePromisifiedMutation } from '~/hooks/usePromisifiedMutation';

export default function useUnfollowUser() {
  const [unfollowUserMutate] = usePromisifiedMutation<useUnfollowUserMutation>(
    graphql`
      mutation useUnfollowUserMutation($userId: DBID!) {
        unfollowUser(userId: $userId) {
          __typename

          ... on UnfollowUserPayload {
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
      unfolloweeId: string,
      // optimistic list of users followed by logged in user
      followingIds: FollowButtonQueryFragment$data['viewer']['user']['following']
    ) => {
      const optimisticResponse: useUnfollowUserMutation$data = {
        unfollowUser: {
          __typename: 'UnfollowUserPayload',
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
      await unfollowUserMutate({ optimisticResponse, variables: { userId: unfolloweeId } });
    },
    [unfollowUserMutate]
  );
}
