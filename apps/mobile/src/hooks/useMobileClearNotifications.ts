import { setBadgeCountAsync } from 'expo-notifications';
import { useCallback } from 'react';
import { ConnectionHandler, fetchQuery, graphql, useRelayEnvironment } from 'react-relay';

import { useMobileClearNotificationsQuery } from '~/generated/useMobileClearNotificationsQuery.graphql';
import { clearNotifications } from '~/shared/relay/useClearNotifications';

export function useMobileClearNotifications() {
  const environment = useRelayEnvironment();
  return useCallback(async () => {
    setBadgeCountAsync(0);

    const query = await fetchQuery<useMobileClearNotificationsQuery>(
      environment,
      graphql`
        query useMobileClearNotificationsQuery {
          viewer {
            ... on Viewer {
              id

              user {
                dbid
              }
            }
          }
        }
      `,
      {},
      { fetchPolicy: 'store-or-network' }
    ).toPromise();

    if (query?.viewer?.id && query.viewer?.user?.dbid) {
      await clearNotifications(environment, query.viewer.user.dbid, [
        ConnectionHandler.getConnectionID(query.viewer.id, 'NotificationBlueDot_notifications'),
        ConnectionHandler.getConnectionID(query.viewer.id, 'NotificationsFragment_notifications'),
      ]);
    }
  }, [environment]);
}
