import { useCallback, useState } from 'react';
import { graphql } from 'react-relay';

import { useFollowAllRecommendedUsersMutation } from '~/generated/useFollowAllRecommendedUsersMutation.graphql';

import { usePromisifiedMutation } from './usePromisifiedMutation';

export default function useFollowAllRecommendedUsers() {
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

  const [isMutationLoading, setIsMutationLoading] = useState(false);

  return useCallback(async () => {
    setIsMutationLoading(true);
    try {
      await followAllRecommendationsMutate({
        variables: {},
      });
    } catch (error) {
      console.log(error);
    } finally {
      console.log('mutation fired and did not catch any errors');
      setIsMutationLoading(false);
    }
  }, [followAllRecommendationsMutate]);
}
