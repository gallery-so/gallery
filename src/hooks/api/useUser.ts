import useSwr from 'swr';
import { isUserResponseError, User, UserResponse } from 'types/User';

type Props = {
  username?: string;
  address?: string;
};

export default function useUser({ username, address }: Props): User | null {
  const queryParams = username ? `username=${username}` : `address=${address}`;

  const { data } = useSwr<UserResponse>(`/users/get?${queryParams}`);

  if (!username && !address) {
    return null;
  }

  if (!data || isUserResponseError(data)) {
    return null;
  }

  return data;
}
