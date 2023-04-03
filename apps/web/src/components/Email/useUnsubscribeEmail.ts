import { useCallback } from 'react';
import { graphql } from 'react-relay';

import { useToastActions } from '~/contexts/toast/ToastContext';
import { useUnsubscribeEmailMutation } from '~/generated/useUnsubscribeEmailMutation.graphql';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';

type Props = {
  type: 'All' | 'Notifications';
  token: string;
};

export default function useUnsubscribeEmail() {
  const [unsubscribeEmail] = usePromisifiedMutation<useUnsubscribeEmailMutation>(graphql`
    mutation useUnsubscribeEmailMutation($input: UnsubscribeFromEmailTypeInput!)
    @raw_response_type {
      unsubscribeFromEmailType(input: $input) {
        __typename
        ... on UnsubscribeFromEmailTypePayload {
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

  const { pushToast } = useToastActions();

  return useCallback(
    async ({ type, token }: Props) => {
      try {
        const response = await unsubscribeEmail({
          variables: {
            input: {
              type,
              token,
            },
          },
          optimisticUpdater: (store) => {
            const viewer = store.getRoot().getLinkedRecord('viewer');
            const email = viewer?.getLinkedRecord('email');
            const emailNotificationSettings = email?.getLinkedRecord('emailNotificationSettings');
            emailNotificationSettings?.setValue(true, 'unsubscribedFromNotifications');
          },
        });

        if (response?.unsubscribeFromEmailType?.__typename === 'UnsubscribeFromEmailTypePayload') {
          pushToast({
            message:
              'You have successfully unsubscribed. You will no longer receive Notification emails.',
            autoClose: false,
          });
          return;
        }

        pushToast({
          message: 'Unfortunately there was an error unsubscribe your email address.',
          autoClose: false,
        });
      } catch (error) {
        if (error instanceof Error) {
          pushToast({
            message: 'Unfortunately there was an error unsubscribe your email address.',
            autoClose: false,
          });
        }
      }
    },
    [pushToast, unsubscribeEmail]
  );
}
