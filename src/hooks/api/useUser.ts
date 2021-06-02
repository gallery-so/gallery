import { useAuthState } from 'contexts/auth/AuthContext';
import { isLoggedInState } from 'contexts/auth/types';
import { useMemo } from 'react';
import useSwr from 'swr';
import { isUserResponseError, User, UserResponse } from 'types/User';

type Props = {
  id?: string | null;
  username?: string;
  address?: string;
};

export default function useUser({ id, username, address }: Props): User | null {
  const queryParams = useMemo(() => {
    if (id) return `id=${id}`;
    if (username) return `username=${username}`;
    if (address) return `address=${address}`;
    return null;
  }, [id, username, address]);

  const { data } = useSwr<UserResponse>(
    queryParams ? `/users/get?${queryParams}` : null
  );

  if (!username && !address) {
    return null;
  }

  if (!data || isUserResponseError(data)) {
    return null;
  }

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
  useUser({ id: userId });
}
