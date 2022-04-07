import { usePromisifiedMutation } from 'hooks/usePromisifiedMutation';
import { useCallback } from 'react';
import { graphql } from 'relay-runtime';
import { useSWRConfig } from 'swr';
import { User } from 'types/User';
import {
  useUpdateUserMutation,
  useUpdateUserMutation$data,
} from '__generated__/useUpdateUserMutation.graphql';
import { getUserCacheKey } from './useUser';

export default function useUpdateUser() {
  const { mutate } = useSWRConfig();

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

      await updateUser({
        optimisticResponse,
        variables: {
          input: {
            username,
            bio,
          },
        },
      });

      await mutate(['/users/get/current', 'get current user']);

      // Optimistically update both user caches by username, ID
      await mutate(
        getUserCacheKey({ username }),
        (user: User) => ({ ...user, username, bio }),
        false
      );

      await mutate(
        getUserCacheKey({ id: userId }),
        (user: User) => ({ ...user, username, bio }),
        false
      );
    },
    [mutate, updateUser]
  );
}
