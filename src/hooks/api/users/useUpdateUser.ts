import { useCallback } from 'react';
import { UpdateUserRequest, UpdateUserResponse } from './types';
import usePost from '../_rest/usePost';
import { mutate } from 'swr';
import { User } from 'types/User';

export default function useUpdateUser() {
  const updateUser = usePost();

  return useCallback(
    async (userId: string, username: string, bio: string) => {
      const result = await updateUser<UpdateUserResponse, UpdateUserRequest>(
        '/users/update/info',
        'update user',
        { username, bio }
      );

      // optimistically update both caches
      mutate(
        // TODO: use const generator to make reliable mutate key
        [`/users/get?username=${username}`, 'fetch user'],
        (user: User) => ({ ...user, username, bio }),
        false
      );

      mutate(
        [`/users/get?user_id=${userId}`, 'fetch user'],
        (user: User) => ({ ...user, username, bio }),
        false
      );

      return result;
    },
    [updateUser]
  );
}
