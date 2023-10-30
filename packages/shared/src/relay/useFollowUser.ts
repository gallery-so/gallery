import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import { SelectorStoreUpdater } from 'relay-runtime';

import { useFollowUserFragment$key } from '~/generated/useFollowUserFragment.graphql';
import { useFollowUserMutation } from '~/generated/useFollowUserMutation.graphql';

import { usePromisifiedMutation } from './usePromisifiedMutation';

type useFollowUserArgs = {
  queryRef: useFollowUserFragment$key;
  connectionIds: string[];
};

export default function useFollowUser({ queryRef, connectionIds }: useFollowUserArgs) {
  const query = useFragment(
    graphql`
      fragment useFollowUserFragment on Query {
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

  const [followUserMutate] = usePromisifiedMutation<useFollowUserMutation>(
    graphql`
      mutation useFollowUserMutation($userId: DBID!) @raw_response_type {
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

  const updater: SelectorStoreUpdater<useFollowUserMutation['response']> = (store, response) => {
    console.log('store', store);
    if (response.followUser?.__typename === 'FollowUserPayload') {
      /*
      for (const connectionId of connectionIds) {
        const pageInfo = store.get(connectionId)?.getLinkedRecord('pageInfo');

        pageInfo?.setValue(((pageInfo?.getValue('total') as number) ?? 0) + 1, 'total');
      }*/
    }
  };

  return useCallback(
    async (followeeId: string) => {
      await followUserMutate({
        updater,
        optimisticUpdater: updater,
        optimisticResponse: {
          followUser: {
            __typename: 'FollowUserPayload',
            viewer: {
              __typename: 'Viewer',
              id: query.viewer?.id as string,
              user: {
                __typename: 'GalleryUser',
                id: query.viewer?.user?.id as string,
                following: [...(query.viewer?.user?.following ?? []), { id: followeeId }],
              },
            },
          },
        },
        variables: { userId: followeeId },
      });
    },
    [
      followUserMutate,
      query.viewer?.id,
      query.viewer?.user?.following,
      query.viewer?.user?.id,
      updater,
    ]
  );
}
