import { useCallback } from 'react';
import { graphql, SelectorStoreUpdater } from 'relay-runtime';

import { useClearNotificationsMutation } from '~/generated/useClearNotificationsMutation.graphql';

import { useReportError } from '../contexts/ErrorReportingContext';
import { usePromisifiedMutation } from './usePromisifiedMutation';

export function useClearNotifications() {
  const [clear] = usePromisifiedMutation<useClearNotificationsMutation>(graphql`
    mutation useClearNotificationsMutation {
      clearAllNotifications {
        __typename
      }
    }
  `);

  const reportError = useReportError();
  return useCallback(
    async (userId: string, connectionIds: string[]) => {
      const updater: SelectorStoreUpdater<useClearNotificationsMutation['response']> = (store) => {
        for (const connectionId of connectionIds) {
          const connection = store.get(connectionId);

          const edges = connection?.getLinkedRecords('edges');

          edges?.forEach((edge) => {
            edge.getLinkedRecord('node')?.setValue(true, 'seen');
          });

          connection?.setValue(0, 'unseenCount');
        }
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
    },
    [clear, reportError]
  );
}
