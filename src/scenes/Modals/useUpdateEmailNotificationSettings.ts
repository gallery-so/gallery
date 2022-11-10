import { useCallback } from 'react';
import { graphql } from 'react-relay';

import { useUpdateEmailNotificationSettingsMutation } from '~/generated/useUpdateEmailNotificationSettingsMutation.graphql';
import { usePromisifiedMutation } from '~/hooks/usePromisifiedMutation';

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
    (unsubscribedFromNotifications: boolean) => {
      return updateEmailNotificationSettings({
        variables: {
          enabledNotification: {
            unsubscribedFromNotifications,
            // TODO: Remove this since its not needed
            unsubscribedFromAll: false,
          },
        },
      });
    },
    [updateEmailNotificationSettings]
  );
}
