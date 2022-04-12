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
