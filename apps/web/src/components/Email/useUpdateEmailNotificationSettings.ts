import { useCallback } from 'react';
import { graphql } from 'react-relay';

import { useUpdateEmailNotificationSettingsMutation } from '~/generated/useUpdateEmailNotificationSettingsMutation.graphql';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';

type Props = {
  unsubscribedFromNotifications: boolean;
  unsubscribedFromDigest: boolean;
  unsubscribedFromAll: boolean;
};

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
                  unsubscribedFromDigest
                  unsubscribedFromAll
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
    ({ unsubscribedFromNotifications, unsubscribedFromDigest, unsubscribedFromAll }: Props) => {
      return updateEmailNotificationSettings({
        variables: {
          enabledNotification: {
            unsubscribedFromNotifications,
            unsubscribedFromDigest,
            unsubscribedFromAll,
          },
        },
      });
    },
    [updateEmailNotificationSettings]
  );
}
