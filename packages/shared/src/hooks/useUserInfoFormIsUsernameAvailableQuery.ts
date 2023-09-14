import { useCallback } from 'react';
import { fetchQuery, graphql, useRelayEnvironment } from 'react-relay';

import { useUserInfoFormIsUsernameAvailableQuery } from '~/generated/useUserInfoFormIsUsernameAvailableQuery.graphql';

export function useIsUsernameAvailableFetcher() {
  const relayEnvironment = useRelayEnvironment();

  return useCallback(
    async (username: string) => {
      const response = await fetchQuery<useUserInfoFormIsUsernameAvailableQuery>(
        relayEnvironment,
        graphql`
          query useUserInfoFormIsUsernameAvailableQuery($username: String!) {
            user: userByUsername(username: $username) {
              ... on ErrUserNotFound {
                __typename
              }
            }
          }
        `,
        { username }
      ).toPromise();

      if (response?.user?.__typename === 'ErrUserNotFound') {
        return true;
      }
      return false;
    },
    [relayEnvironment]
  );
}
