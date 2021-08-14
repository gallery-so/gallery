import { useAuthState } from 'contexts/auth/AuthContext';
import { isLoggedInState } from 'contexts/auth/types';
import { useMemo } from 'react';
import { User } from 'types/User';
import useGet from '../_rest/useGet';

type Props = {
  id?: string | null;
  username?: string;
  address?: string;
};

export default function useUser({
  id,
  username,
  address,
}: Props): User | undefined {
  const queryParams = useMemo(() => {
    if (id) return `user_id=${id}`;
    if (username) return `username=${username}`;
    if (address) return `address=${address}`;
    return null;
  }, [id, username, address]);

  const data = useGet<User>(
    queryParams ? `/users/get?${queryParams}` : null,
    'fetch user'
  );

  return data;
}

export function useAuthenticatedUser() {
  const state = useAuthState();
  const userId = useMemo(() => {
    if (isLoggedInState(state)) {
      return state.userId;
    }
    return null;
  }, [state]);
  const user = useUser({ id: userId });
  return user;
}
