import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import { SelectorStoreUpdater } from 'relay-runtime';

import { OnboardingRecommendedUsersInnerFragment$data } from '~/generated/OnboardingRecommendedUsersInnerFragment.graphql';
import { useFollowAllRecommendedUsersMutation } from '~/generated/useFollowAllRecommendedUsersMutation.graphql';
import { useFollowAllRecommendedUsersQueryFragment$key } from '~/generated/useFollowAllRecommendedUsersQueryFragment.graphql';

import { usePromisifiedMutation } from './usePromisifiedMutation';

type useFollowAllRecommendedUsersArgs = {
  suggestedFollowing: OnboardingRecommendedUsersInnerFragment$data;
  queryRef: useFollowAllRecommendedUsersQueryFragment$key;
};

export default function useFollowAllRecommendedUsers({
  suggestedFollowing,
  queryRef,
}: useFollowAllRecommendedUsersArgs) {
  const query = useFragment(
    graphql`
      fragment useFollowAllRecommendedUsersQueryFragment on Query {
        viewer {
          ... on Viewer {
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

  const [followAllRecommendationsMutate] =
    usePromisifiedMutation<useFollowAllRecommendedUsersMutation>(
      graphql`
        mutation useFollowAllRecommendedUsersMutation {
          followAllOnboardingRecommendations {
            __typename

            ... on FollowAllOnboardingRecommendationsPayload {
              viewer {
                __typename
                user @required(action: THROW) {
                  __typename
                  id
                  following {
                    id
                  }
                }
              }
            }
            ... on ErrNotAuthorized {
              message
            }
            ... on ErrInvalidInput {
              message
            }
          }
        }
      `
    );

  return useCallback(async () => {
    const updater: SelectorStoreUpdater<useFollowAllRecommendedUsersMutation['response']> = (
      store,
      response
    ) => {
      const followingUserIds = suggestedFollowing.map((user) => user.id);

      if (
        response.followAllOnboardingRecommendations?.__typename ===
        'FollowAllOnboardingRecommendationsPayload'
      ) {
        const currentId = query?.viewer?.user?.id;
        if (!currentId) {
          return;
        }

        const currentUser = store.get(currentId);
        if (!currentUser) {
          return;
        }

        const following = currentUser?.getLinkedRecords('following') ?? [];
        const addToList = [];
        for (const userId of followingUserIds) {
          const user = store.get(userId);
          if (user) {
            addToList.push(user);
          }
        }
        if (following && addToList) {
          currentUser.setLinkedRecords([...following, ...addToList], 'following');
        }
      }
    };

    await followAllRecommendationsMutate({
      variables: {},
      updater,
      optimisticResponse: {
        followAllOnboardingRecommendations: {
          __typename: 'FollowAllOnboardingRecommendationsPayload',
          viewer: {
            __typename: 'Viewer',
            user: {
              __typename: 'User',
              id: query.viewer?.user?.id as string,
              following: [
                ...(query.viewer?.user?.following ?? []),
                ...suggestedFollowing.map((user) => ({ id: `GalleryUser:${user.id}` })),
              ],
            },
          },
        },
      },
    });
  }, [
    followAllRecommendationsMutate,
    query.viewer?.user?.following,
    suggestedFollowing,
    query.viewer?.user?.id,
  ]);
}
