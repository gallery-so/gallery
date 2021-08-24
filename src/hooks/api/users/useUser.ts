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

const getUserAction = 'fetch user';

const getUserBaseUrl = '/users/get';

function getUserBaseUrlWithQuery({ id, username, address }: Props) {
  let query = '';
  if (id) query = `user_id=${id}`;
  if (username) query = `username=${username}`;
  if (address) query = `address=${address}`;
  return `${getUserBaseUrl}?${query}`;
}

// allows access to user cache within SWR. useful for mutations
export function getUserCacheKey(queryParams: Props) {
  return [getUserBaseUrlWithQuery(queryParams), getUserAction];
}

export default function useUser(props: Props): User | undefined {
  const validParams = props.id || props.username || props.address;

  const data = useGet<User>(
    validParams ? getUserBaseUrlWithQuery(props) : null,
    getUserAction
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

export function useAuthenticatedUserAddress() {
  const user = useAuthenticatedUser();

  if (!user) {
    throw new Error('Authenticated user not found');
  }

  const address = user.addresses?.[0];
  if (!address) {
    throw new Error('No address found on user');
  }
  return address;
}
