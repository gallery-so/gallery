export type User = {
  id: string;
  creationTime: string;
  username: string;
  displayName: string;
  description: string;
  addresses: string[];
};

export type UpdateUserResponse = null;

export type UpdateUserRequest = {
  user_id: string;
  username: string;
  description: string;
};
