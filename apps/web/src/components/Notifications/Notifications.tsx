import { Suspense, useEffect } from 'react';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import Loader from '~/components/core/Loader/Loader';
import {
  NotificationList,
  NOTIFICATIONS_PER_PAGE,
} from '~/components/Notifications/NotificationList';
import { useClearNotifications } from '~/components/Notifications/useClearNotifications';
import { NotificationsQuery } from '~/generated/NotificationsQuery.graphql';

import breakpoints from '../core/breakpoints';
import { VStack } from '../core/Spacer/Stack';

export function Notifications() {
  const query = useLazyLoadQuery<NotificationsQuery>(
    graphql`
      query NotificationsQuery($notificationsLast: Int!, $notificationsBefore: String) {
        ...NotificationListFragment

        viewer {
          ... on Viewer {
            user {
              dbid
            }
          }
        }
      }
    `,
    { notificationsLast: NOTIFICATIONS_PER_PAGE },
    { fetchPolicy: 'store-and-network' }
  );

  const clearAllNotifications = useClearNotifications();

  const userId = query.viewer?.user?.dbid ?? '';
  useEffect(() => {
    // When they close the modal, clear their notifications
    return () => {
      clearAllNotifications(userId);
    };
  }, [clearAllNotifications, userId]);

  return (
    <ModalContent>
      <Suspense
        fallback={
          <VStack grow justify="center" align="center">
            <Loader size="large" />
          </VStack>
        }
      >
        <NotificationList queryRef={query} />
      </Suspense>
    </ModalContent>
  );
}

const ModalContent = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 4px;

  @media only screen and ${breakpoints.tablet} {
    width: 420px;
  }
`;
