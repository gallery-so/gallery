import { NotificationListFragment$key } from '__generated__/NotificationListFragment.graphql';
import { useCallback, useMemo } from 'react';
import { usePaginationFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { VStack } from '~/components/core/Spacer/Stack';
import { TitleDiatypeL } from '~/components/core/Text/Text';
import { SeeMore } from '~/components/NotificationsModal/SeeMore';
import { ENABLE_EMAIL_DISMISSED_KEY } from '~/constants/storageKeys';
import usePersistedState from '~/hooks/usePersistedState';
import isFeatureEnabled, { FeatureFlag } from '~/utils/graphql/isFeatureEnabled';

import { Notification } from './Notification';
import { NotificationEmailAlert } from './NotificationEmailAlert';

export const NOTIFICATIONS_PER_PAGE = 10;

type NotificationListProps = {
  queryRef: NotificationListFragment$key;
};

export const FAILED_EMAIL_VERIFICATION_STATUS = ['Failed', 'Unverified'];

export function NotificationList({ queryRef }: NotificationListProps) {
  const {
    data: query,
    loadPrevious,
    hasPrevious,
    isLoadingPrevious,
  } = usePaginationFragment(
    graphql`
      fragment NotificationListFragment on Query
      @refetchable(queryName: "NotificationsModalRefetchableQuery") {
        viewer {
          ... on Viewer {
            notifications(last: $notificationsLast, before: $notificationsBefore)
              @connection(key: "NotificationsModalFragment_notifications") {
              edges {
                node {
                  id
                  ...NotificationFragment
                }
              }
            }

            email @required(action: THROW) {
              verificationStatus @required(action: THROW)
            }
          }
        }

        ...NotificationQueryFragment
        ...NotificationEmailAlertQueryFragment
        ...isFeatureEnabledFragment
      }
    `,
    queryRef
  );

  const [emailDismissed, setEmailDismissed] = usePersistedState(ENABLE_EMAIL_DISMISSED_KEY, false);
  const handleDismiss = useCallback(() => {
    setEmailDismissed(true);
  }, [setEmailDismissed]);

  const nonNullNotifications = useMemo(() => {
    const notifications = [];

    for (const edge of query.viewer?.notifications?.edges ?? []) {
      if (edge?.node) {
        notifications.push(edge.node);
      }
    }

    notifications.reverse();

    return notifications;
  }, [query.viewer?.notifications?.edges]);

  const handleSeeMore = useCallback(() => {
    loadPrevious(NOTIFICATIONS_PER_PAGE);
  }, [loadPrevious]);

  const hasNotifications = nonNullNotifications.length > 0;
  const isEmailFeatureEnabled = isFeatureEnabled(FeatureFlag.EMAIL, query);

  const showEmailAlert =
    FAILED_EMAIL_VERIFICATION_STATUS.includes(query.viewer?.email?.verificationStatus ?? '') &&
    !emailDismissed &&
    isEmailFeatureEnabled;

  return (
    <NotificationsContent grow>
      {showEmailAlert && <NotificationEmailAlert queryRef={query} onDismiss={handleDismiss} />}
      {hasNotifications ? (
        <>
          {nonNullNotifications.map((notification) => {
            return (
              <Notification queryRef={query} key={notification.id} notificationRef={notification} />
            );
          })}

          {hasPrevious && <SeeMore onClick={handleSeeMore} isLoading={isLoadingPrevious} />}
        </>
      ) : (
        <EmptyContainer grow justify="center">
          <EmptyNotificationsText>Nothing to see here yet.</EmptyNotificationsText>
        </EmptyContainer>
      )}
    </NotificationsContent>
  );
}

const EmptyContainer = styled(VStack)``;

const EmptyNotificationsText = styled(TitleDiatypeL)`
  text-align: center;
`;

const NotificationsContent = styled(VStack)`
  width: 100%;
`;
