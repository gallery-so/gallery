import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';

import { useUnfollowUserFragment$key } from '~/generated/useUnfollowUserFragment.graphql';
import { useUnfollowUserMutation } from '~/generated/useUnfollowUserMutation.graphql';

import { usePromisifiedMutation } from './usePromisifiedMutation';

type useUnfollowUserArgs = {
  queryRef: useUnfollowUserFragment$key;
};

export default function useUnfollowUser({ queryRef }: useUnfollowUserArgs) {
  const query = useFragment(
    graphql`
      fragment useUnfollowUserFragment on Query {
        viewer {
          ... on Viewer {
            id
            user {
              id
              following {
                id
              }
            }
          }
        }
      }
    `,
    queryRef
  );

  const [unfollowUserMutate] = usePromisifiedMutation<useUnfollowUserMutation>(
    graphql`
      mutation useUnfollowUserMutation($userId: DBID!) @raw_response_type {
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
    async (unfolloweeId: string) => {
      await unfollowUserMutate({
        optimisticResponse: {
          unfollowUser: {
            __typename: 'UnfollowUserPayload',
            viewer: {
              __typename: 'Viewer',
              id: query.viewer?.id as string,
              user: {
                __typename: 'GalleryUser',
                id: query.viewer?.user?.id as string,
                following:
                  query.viewer?.user?.following?.filter(
                    (followee) => followee?.id !== `GalleryUser:${unfolloweeId}`
                  ) ?? [],
              },
            },
          },
        },
        variables: { userId: unfolloweeId },
      });
    },
    [query.viewer?.id, query.viewer?.user?.following, query.viewer?.user?.id, unfollowUserMutate]
  );
}
