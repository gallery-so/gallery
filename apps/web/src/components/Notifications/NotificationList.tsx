import { useCallback, useMemo } from 'react';
import { usePaginationFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { VStack } from '~/components/core/Spacer/Stack';
import { TitleDiatypeL } from '~/components/core/Text/Text';
import { SeeMore } from '~/components/Notifications/SeeMore';
import { NotificationListFragment$key } from '~/generated/NotificationListFragment.graphql';
import useExperience from '~/shared/hooks/useExperience';

import { Notification } from './Notification';
import { NotificationEmailAlert } from './NotificationEmailAlert';
import { NotificationTwitterAlert } from './NotificationTwitterAlert';

export const NOTIFICATIONS_PER_PAGE = 15;

type NotificationListProps = {
  queryRef: NotificationListFragment$key;
  toggleSubView: (page?: JSX.Element) => void;
};

export const FAILED_EMAIL_VERIFICATION_STATUS = ['Failed', 'Unverified'];

export function NotificationList({ queryRef, toggleSubView }: NotificationListProps) {
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
              @connection(key: "NotificationsFragment_notifications") {
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
        ...NotificationTwitterAlertFragment
        ...useExperienceFragment
      }
    `,
    queryRef
  );

  const [isEmailUpsellExperienced, setEmailExperienced] = useExperience({
    type: 'EmailUpsell',
    queryRef: query,
  });

  const handleDismiss = useCallback(async () => {
    await setEmailExperienced();
  }, [setEmailExperienced]);

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

  const showEmailAlert =
    FAILED_EMAIL_VERIFICATION_STATUS.includes(query.viewer?.email?.verificationStatus ?? '') &&
    !isEmailUpsellExperienced;

  return (
    <NotificationsContent grow>
      {showEmailAlert && <NotificationEmailAlert queryRef={query} onDismiss={handleDismiss} />}
      <NotificationTwitterAlert queryRef={query} />
      {hasNotifications ? (
        <>
          {nonNullNotifications.map((notification) => {
            return (
              <Notification
                queryRef={query}
                key={notification.id}
                notificationRef={notification}
                toggleSubView={toggleSubView}
              />
            );
          })}

          {hasPrevious && <SeeMore onClick={handleSeeMore} isLoading={isLoadingPrevious} />}
        </>
      ) : (
        <EmptyContainer grow justify="center" align="center">
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
  height: 100%;
`;
