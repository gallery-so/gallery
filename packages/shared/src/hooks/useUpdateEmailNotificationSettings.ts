import { useCallback } from 'react';
import { graphql } from 'react-relay';

import { useUpdateEmailNotificationSettingsMutation } from '~/generated/useUpdateEmailNotificationSettingsMutation.graphql';
import { usePromisifiedMutation } from '../relay/usePromisifiedMutation';

type Props = {
  unsubscribedFromNotifications: boolean;
  unsubscribedFromDigest: boolean;
  unsubscribedFromMarketing: boolean;
  unsubscribedFromMembersClub: boolean;
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
                  unsubscribedFromMarketing
                  unsubscribedFromMembersClub
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
    ({
      unsubscribedFromNotifications,
      unsubscribedFromDigest,
      unsubscribedFromMarketing,
      unsubscribedFromMembersClub,
      unsubscribedFromAll,
    }: Props) => {
      return updateEmailNotificationSettings({
        variables: {
          enabledNotification: {
            unsubscribedFromNotifications,
            unsubscribedFromDigest,
            unsubscribedFromMarketing,
            unsubscribedFromMembersClub,
            unsubscribedFromAll,
          },
        },
      });
    },
    [updateEmailNotificationSettings]
  );
}
