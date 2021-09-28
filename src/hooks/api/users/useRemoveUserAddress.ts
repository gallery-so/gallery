import { useCallback } from 'react';
import { mutate } from 'swr';
import { User } from 'types/User';
import usePost from '../_rest/usePost';
import { getUserCacheKey, useAuthenticatedUser } from './useUser';

type RemoveUserAddressRequest = {
  addresses: string[];
};

type RemoveUserAddressResponse = {
  success: boolean;
};
export default function useRemoveUserAddress() {
  const user = useAuthenticatedUser();
  const removeUserAddress = usePost();

  return useCallback(
    async (addressToRemove: string) => {
      await removeUserAddress<RemoveUserAddressResponse, RemoveUserAddressRequest>(
        '/users/update/addresses/remove',
        'remove user address',
        { addresses: [addressToRemove] },
      );

      // Optimistically update both user caches by username, ID
      await mutate(
        getUserCacheKey({ username: user.username }),
        (user: User) => {
          const addresses = user.addresses.filter(address => address !== addressToRemove);
          return { ...user, addresses };
        },
        false,
      );

      await mutate(
        getUserCacheKey({ id: user.id }),
        (user: User) => {
          const addresses = user.addresses.filter(address => address !== addressToRemove);
          return { ...user, addresses };
        },
        false,
      );
    },
    [removeUserAddress, user.id, user.username],
  );
}
