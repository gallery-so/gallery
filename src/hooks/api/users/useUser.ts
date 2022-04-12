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

export default function useUser(props: Props): User | undefined {
  const validParameters = props.id ?? props.username ?? props.address;

  const data = useGet<User>(validParameters ? getUserBaseUrlWithQuery(props) : null, getUserAction);

  return data;
}

function useCurrentUser(makeRequest = true): User | undefined {
  const data = useGet<User>(makeRequest ? '/users/get/current' : null, 'get current user');
  return data;
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
