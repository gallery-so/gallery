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
          }
          ... on ErrNotAuthorized {
            __typename
          }
          ... on ErrUserAlreadyExists {
            __typename
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

      if (response.updateUserInfo?.__typename === 'ErrUserAlreadyExists') {
        throw new Error('Username is taken');
      }
      if (response.updateUserInfo?.__typename === 'ErrInvalidInput') {
        throw new Error('Username or bio is invalid');
      }
      // TODO: log the user out
      if (response.updateUserInfo?.__typename === 'ErrNotAuthorized') {
        throw new Error('You are not authorized!');
      }
    },
    [updateUser]
  );
}
