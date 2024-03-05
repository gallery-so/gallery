import { useCallback } from 'react';
import { graphql } from 'react-relay';

import { useUpdateEmailNotificationSettingsMutation } from '~/generated/useUpdateEmailNotificationSettingsMutation.graphql';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';

export default function useUpdateEmailNotificationSettings() {
  const [updateEmailNotificationSettings] =
    usePromisifiedMutation<useUpdateEmailNotificationSettingsMutation>(graphql`
      mutation useUpdateEmailNotificationSettingsMutation(
        $enabledNotification: UpdateEmailNotificationSettingsInput!
      ) @raw_response_type {
        updateEmailNotificationSettings(input: $enabledNotification) {
          ... on UpdateEmailNotificationSettingsPayload {
            viewer {
              email {
                emailNotificationSettings {
                  unsubscribedFromNotifications
                }
              }
            }
          }
          ... on ErrInvalidInput {
            __typename
          }
        }
      }
    `);

  return useCallback(
    (
      unsubscribedFromNotifications: boolean,
      unsubscribedFromAll: boolean,
      unsubscribedFromDigest: boolean
    ) => {
      return updateEmailNotificationSettings({
        variables: {
          enabledNotification: {
            unsubscribedFromNotifications,
            unsubscribedFromAll,
            unsubscribedFromDigest,
          },
        },
      });
    },
    [updateEmailNotificationSettings]
  );
}
