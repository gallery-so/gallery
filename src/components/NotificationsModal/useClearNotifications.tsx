import { useCallback } from 'react';
import { ConnectionHandler, graphql, SelectorStoreUpdater } from 'relay-runtime';

import { useReportError } from '~/contexts/errorReporting/ErrorReportingContext';
import { usePromisifiedMutation } from '~/hooks/usePromisifiedMutation';

import { useClearNotificationsMutation } from '../../../__generated__/useClearNotificationsMutation.graphql';

export function useClearNotifications() {
  const [clear] = usePromisifiedMutation<useClearNotificationsMutation>(graphql`
    mutation useClearNotificationsMutation {
      clearAllNotifications {
        notifications {
          ...NotificationFragment
        }
      }
    }
  `);

  const reportError = useReportError();
  return useCallback(async () => {
    const updater: SelectorStoreUpdater<useClearNotificationsMutation['response']> = (store) => {
      const connectionId = ConnectionHandler.getConnectionID(
        'client:root:viewer',
        'ProfileDropdownContentFragment_notifications'
      );

      const connection = store.get(connectionId);

      connection?.setValue(0, 'unseenCount');
    };

    try {
      await clear({ optimisticUpdater: updater, updater, variables: {} });
    } catch (error) {
      if (error instanceof Error) {
        reportError(error);
      } else {
        reportError('Something unexpected went wrong while trying to clear all notifications');
      }
    }
  }, [clear, reportError]);
}
