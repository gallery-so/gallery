import { NotificationListFragment$key } from '__generated__/NotificationListFragment.graphql';
import { useCallback, useMemo } from 'react';
import { usePaginationFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { VStack } from '~/components/core/Spacer/Stack';
import { TitleDiatypeL } from '~/components/core/Text/Text';
import { SeeMore } from '~/components/NotificationsModal/SeeMore';

import { Notification } from './Notification';

export const NOTIFICATIONS_PER_PAGE = 10;

type NotificationListProps = {
  queryRef: NotificationListFragment$key;
};

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
          }
        }

        ...NotificationQueryFragment
      }
    `,
    queryRef
  );

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

  return (
    <NotificationsContent grow>
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
        <>
          <EmptyNotificationsText>Nothing to see here yet.</EmptyNotificationsText>
        </>
      )}
    </NotificationsContent>
  );
}

const EmptyNotificationsText = styled(TitleDiatypeL)`
  text-align: center;
`;

const NotificationsContent = styled(VStack)`
  width: 100%;
`;
