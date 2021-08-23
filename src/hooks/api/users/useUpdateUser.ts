import { useCallback } from 'react';
import { UpdateUserRequest, UpdateUserResponse } from './types';
import usePost from '../_rest/usePost';
import { mutate } from 'swr';
import { User } from 'types/User';
import { getUserCacheKey } from './useUser';

export default function useUpdateUser() {
  const updateUser = usePost();

  return useCallback(
    async (userId: string, username: string, bio: string) => {
      const result = await updateUser<UpdateUserResponse, UpdateUserRequest>(
        '/users/update/info',
        'update user',
        { username, bio }
      );

      // optimistically update both user caches by username, ID
      mutate(
        getUserCacheKey({ username }),
        (user: User) => ({ ...user, username, bio }),
        false
      );

      mutate(
        getUserCacheKey({ id: userId }),
        (user: User) => ({ ...user, username, bio }),
        false
      );

      return result;
    },
    [updateUser]
  );
}
