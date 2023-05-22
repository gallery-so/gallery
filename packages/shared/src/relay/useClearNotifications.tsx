import { useCallback } from 'react';
import { useRelayEnvironment } from 'react-relay';
import { commitMutation, graphql, SelectorStoreUpdater } from 'relay-runtime';
import RelayModernEnvironment from 'relay-runtime/lib/store/RelayModernEnvironment';

import {
  useClearNotificationsMutation,
  useClearNotificationsMutation$data,
} from '~/generated/useClearNotificationsMutation.graphql';

import { useReportError } from '../contexts/ErrorReportingContext';

export function clearNotifications(
  environment: RelayModernEnvironment,
  userId: string,
  connectionIds: string[]
): Promise<useClearNotificationsMutation$data> {
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

  return new Promise<useClearNotificationsMutation$data>((resolve, reject) => {
    commitMutation<useClearNotificationsMutation>(environment, {
      updater,
      optimisticUpdater: updater,
      variables: {},
      mutation: graphql`
        mutation useClearNotificationsMutation {
          clearAllNotifications {
            __typename
          }
        }
      `,
      onCompleted: (response) => {
        resolve(response);
      },
      onError: reject,
    });
  });
}

export function useClearNotifications() {
  const reportError = useReportError();
  const relayEnvironment = useRelayEnvironment();

  return useCallback(
    async (userId: string, connectionIds: string[]) => {
      try {
        clearNotifications(relayEnvironment, userId, connectionIds);
      } catch (error) {
        if (error instanceof Error) {
          reportError(error);
        } else {
          reportError('Something unexpected went wrong while trying to clear all notifications');
        }
      }
    },
    [relayEnvironment, reportError]
  );
}
