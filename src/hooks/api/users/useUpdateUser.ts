import { usePromisifiedMutation } from 'hooks/usePromisifiedMutation';
import { useCallback } from 'react';
import { graphql } from 'relay-runtime';
import {
  useUpdateUserMutation,
  useUpdateUserMutation$data,
} from '__generated__/useUpdateUserMutation.graphql';

export default function useUpdateUser() {
  const [updateUser] = usePromisifiedMutation<useUpdateUserMutation>(
    graphql`
      mutation useUpdateUserMutation($input: UpdateUserInfoInput!) {
        updateUserInfo(input: $input) {
          __typename
          ... on UpdateUserInfoPayload {
            viewer {
              user {
                id
                username
                bio
              }
            }
          }
          ... on ErrInvalidInput {
            __typename
            reasons
          }
        }
      }
    `
  );

  return useCallback(
    async (userId: string, username: string, bio: string) => {
      const optimisticResponse: useUpdateUserMutation$data = {
        updateUserInfo: {
          __typename: 'UpdateUserInfoPayload',
          viewer: {
            user: {
              id: `GalleryUser:${userId}`,
              username,
              bio,
            },
          },
        },
      };

      const response = await updateUser({
        optimisticResponse,
        variables: {
          input: {
            username,
            bio,
          },
        },
      });
      console.log(response);
    },
    [updateUser]
  );
}
