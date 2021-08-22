import { useCallback } from 'react';
import { UpdateUserRequest, UpdateUserResponse } from './types';
import usePost from '../_rest/usePost';

export default function useUpdateUser() {
  const updateUser = usePost();

  return useCallback(
    async (username: string, bio: string) => {
      const result = await updateUser<UpdateUserResponse, UpdateUserRequest>(
        '/users/update/info',
        'update user',
        { username, bio }
      );

      return result;
    },
    [updateUser]
  );
}
