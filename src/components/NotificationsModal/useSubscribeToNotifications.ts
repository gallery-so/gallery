import { useMemo } from 'react';
import { useSubscription } from 'react-relay';
import { ConnectionHandler, graphql, GraphQLSubscriptionConfig } from 'relay-runtime';

import { useSubscribeToNotificationsCreateSubscription } from '~/generated/useSubscribeToNotificationsCreateSubscription.graphql';
import { useSubscribeToNotificationsUpdateSubscription } from '~/generated/useSubscribeToNotificationsUpdateSubscription.graphql';

export function useSubscribeToNotifications() {
  const connections = useMemo(() => {
    const connectionKey = 'NotificationsModalFragment_notifications';
    const connectionId = ConnectionHandler.getConnectionID('client:root:viewer', connectionKey);

    return [connectionId];
  }, []);

  const newNotificationConfig =
    useMemo((): GraphQLSubscriptionConfig<useSubscribeToNotificationsCreateSubscription> => {
      return {
        variables: { connections },
        subscription: graphql`
          subscription useSubscribeToNotificationsCreateSubscription($connections: [ID!]!) {
            newNotification
              @appendNode(edgeTypeName: "NotificationEdge", connections: $connections) {
              ...NotificationFragment
            }
          }
        `,
      };
    }, [connections]);

  const updatedNotificationConfig =
    useMemo((): GraphQLSubscriptionConfig<useSubscribeToNotificationsUpdateSubscription> => {
      return {
        variables: {
          connections,
        },
        subscription: graphql`
          subscription useSubscribeToNotificationsUpdateSubscription {
            notificationUpdated {
              ...NotificationFragment
            }
          }
        `,
      };
    }, [connections]);

  useSubscription(newNotificationConfig);
  useSubscription(updatedNotificationConfig);
}
