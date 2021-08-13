import { useCallback } from 'react';
import { UpdateUserRequest, UpdateUserResponse } from './types';
import { useAuthenticatedUser } from './useUser';
import usePost from '../_rest/usePost';

export default function useUpdateUser() {
  const updateUser = usePost();
  const authenticatedUser = useAuthenticatedUser();

  return useCallback(
    async (username: string, bio: string) => {
      if (!authenticatedUser) return;

      const result = await updateUser<UpdateUserResponse, UpdateUserRequest>(
        '/users/update',
        'update user',
        {
          user_id: authenticatedUser.id,
          username,
          description: bio,
        }
      );

      return result;
    },
    [authenticatedUser, updateUser]
  );
}
