import { useAuthState } from 'contexts/auth/AuthContext';
import { isLoggedInState } from 'contexts/auth/typeguards';
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
  if (id) {
    query = `user_id=${id}`;
  }

  if (username) {
    query = `username=${username}`;
  }

  if (address) {
    query = `address=${address}`;
  }

  return `${getUserBaseUrl}?${query}`;
}

// Allows access to user cache within SWR. useful for mutations
export function getUserCacheKey(queryParameters: Props) {
  return [getUserBaseUrlWithQuery(queryParameters), getUserAction];
}

export default function useUser(props: Props): User | undefined {
  const validParameters = props.id ?? props.username ?? props.address;

  const data = useGet<User>(validParameters ? getUserBaseUrlWithQuery(props) : null, getUserAction);

  return data;
}

function useCurrentUser(makeRequest = true): User | undefined {
  const data = useGet<User>(makeRequest ? '/users/get/current' : null, 'get current user');
  return data;
}

// TODO: we can probably remove this by refactoring the components that use it
// use this hook to get the current logged in user when when you don't always expect one to be returned.
// ie in a component that is rendered for all users
export function usePossiblyAuthenticatedUser() {
  const state = useAuthState();
  const isLoggedIn = useMemo(() => isLoggedInState(state), [state]);
  const user = useCurrentUser(isLoggedIn);
  if (isLoggedIn && !user) {
    throw new Error('Authenticated user not found');
  }

  return user;
}

// use this hook to get the current logged in user when you expect one to be returned.
// ie in a component that is only rendered for authenticated users
export function useAuthenticatedUser() {
  const user = useCurrentUser();
  if (!user) {
    throw new Error('Authenticated user not found');
  }

  return user;
}

export function useAuthenticatedUserAddress() {
  const user = useAuthenticatedUser();

  const address = user.addresses?.[0];
  if (!address) {
    throw new Error('No address found on user');
  }

  return address;
}

export function useAuthenticatedUserAddresses() {
  const user = useAuthenticatedUser();

  return user.addresses;
}

export function useAuthenticatedUsername() {
  const user = useAuthenticatedUser();

  return user.username;
}
