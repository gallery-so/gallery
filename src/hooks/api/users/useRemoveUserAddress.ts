import { useCallback } from 'react';
import { useSWRConfig } from 'swr';
import { User } from 'types/User';
import usePost from '../_rest/usePost';

type RemoveUserAddressRequest = {
  addresses: string[];
};

type RemoveUserAddressResponse = {
  success: boolean;
};
export default function useRemoveUserAddress() {
  const removeUserAddress = usePost();
  const { mutate } = useSWRConfig();

  return useCallback(
    async (addressToRemove: string) => {
      await removeUserAddress<RemoveUserAddressResponse, RemoveUserAddressRequest>(
        '/users/update/addresses/remove',
        'remove user address',
        { addresses: [addressToRemove] }
      );

      await mutate(
        ['/users/get/current', 'get current user'],
        (user: User) => {
          const addresses = user?.addresses.filter((address) => address !== addressToRemove);
          return { ...user, addresses };
        },
        false
      );
    },
    [mutate, removeUserAddress]
  );
}
