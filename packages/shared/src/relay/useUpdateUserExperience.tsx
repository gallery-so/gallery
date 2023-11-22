import { useCallback } from 'react';
import { graphql } from 'react-relay';

import {
  UserExperienceType,
  useUpdateUserExperienceMutation,
  useUpdateUserExperienceMutation$data,
} from '~/generated/useUpdateUserExperienceMutation.graphql';

import { usePromisifiedMutation } from './usePromisifiedMutation';

type Props = {
  type: UserExperienceType;
  experienced: boolean;
  optimisticExperiencesList: ReadonlyArray<{
    readonly experienced: boolean;
    readonly type: UserExperienceType;
  }> | null;
};

/**
 * NOTE: This is the raw request used by the more convenient `useExperience` hook. You may want to use that instead.
 */
export default function useUpdateUserExperience() {
  const [updateUserExperience] = usePromisifiedMutation<useUpdateUserExperienceMutation>(graphql`
    mutation useUpdateUserExperienceMutation($input: UpdateUserExperienceInput!)
    @raw_response_type {
      updateUserExperience(input: $input) {
        __typename
        ... on UpdateUserExperiencePayload {
          viewer {
            userExperiences {
              type
              experienced
            }
          }
        }
        ... on ErrInvalidInput {
          __typename
        }
      }
    }
  `);

  return useCallback(
    async ({ type, experienced, optimisticExperiencesList }: Props) => {
      try {
        const optimisticResponse: useUpdateUserExperienceMutation$data = {
          updateUserExperience: {
            __typename: 'UpdateUserExperiencePayload',
            viewer: {
              userExperiences: optimisticExperiencesList,
            },
          },
        };
        await updateUserExperience({
          optimisticResponse,
          variables: {
            input: {
              experienceType: type,
              experienced,
            },
          },
        });
      } catch (error) {
        if (error instanceof Error) {
          // TODO throw error for consumer to use
        }
      }
    },
    [updateUserExperience]
  );
}

// Optimistically marking experiences as dismissed is almost always the intent
export function useOptimisticallyDismissExperience() {
  const update = useUpdateUserExperience();

  return useCallback(
    (experienceKey: UserExperienceType) => {
      update({
        type: experienceKey,
        experienced: true,
        optimisticExperiencesList: [
          {
            type: experienceKey,
            experienced: true,
          },
        ],
      });
    },
    [update]
  );
}
