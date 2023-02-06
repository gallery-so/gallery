import { useCallback } from 'react';
import { graphql } from 'react-relay';

import { useToastActions } from '~/contexts/toast/ToastContext';
import {
  UserExperienceType,
  useUpdateUserExperienceMutation,
} from '~/generated/useUpdateUserExperienceMutation.graphql';
import { usePromisifiedMutation } from '~/hooks/usePromisifiedMutation';

type Props = {
  type: UserExperienceType;
  experienced: boolean;
};

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

  const { pushToast } = useToastActions();

  return useCallback(
    async ({ type, experienced }: Props) => {
      try {
        await updateUserExperience({
          variables: {
            input: {
              experienceType: type,
              experienced,
            },
          },
        });
      } catch (error) {
        if (error instanceof Error) {
          pushToast({
            message: 'Unfortunately there was an error to save the settings.',
          });
        }
      }
    },
    [pushToast, updateUserExperience]
  );
}
