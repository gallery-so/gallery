export type User = {
  id: string;
  creationTime: string;
  username: string;
  displayName: string;
  description: string;
  addresses: string[];
};

type UserNotFoundError = {
  error: 'ERR_USER_NOT_FOUND';
};

export type UserResponse = User | UserNotFoundError;

// typeguard
export function isUserResponseError(
  res: UserResponse
): res is UserNotFoundError {
  return 'error' in res;
}
