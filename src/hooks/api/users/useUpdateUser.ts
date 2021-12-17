import { useCallback } from 'react';
import { useSWRConfig } from 'swr';
import { User } from 'types/User';
import usePost from '../_rest/usePost';
import { UpdateUserRequest, UpdateUserResponse } from './types';
import { getUserCacheKey } from './useUser';

export default function useUpdateUser() {
  const updateUser = usePost();
  const { mutate } = useSWRConfig();

  return useCallback(
    async (userId: string, username: string, bio: string) => {
      await updateUser<UpdateUserResponse, UpdateUserRequest>('/users/update/info', 'update user', {
        username,
        bio,
      });

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
