import { Suspense, useEffect } from 'react';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import Loader from '~/components/core/Loader/Loader';
import { TitleDiatypeM } from '~/components/core/Text/Text';
import {
  NotificationList,
  NOTIFICATIONS_PER_PAGE,
} from '~/components/NotificationsModal/NotificationList';
import { useClearNotifications } from '~/components/NotificationsModal/useClearNotifications';
import { MODAL_PADDING_PX } from '~/contexts/modal/constants';
import { NotificationsModalQuery } from '~/generated/NotificationsModalQuery.graphql';

import breakpoints from '../core/breakpoints';
import { VStack } from '../core/Spacer/Stack';

type NotificationsModalProps = {
  fullscreen: boolean;
};

export function NotificationsModal({ fullscreen }: NotificationsModalProps) {
  const query = useLazyLoadQuery<NotificationsModalQuery>(
    graphql`
      query NotificationsModalQuery($notificationsLast: Int!, $notificationsBefore: String) {
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
    <ModalContent fullscreen={fullscreen}>
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

const ModalContent = styled.div<{ fullscreen: boolean }>`
  height: ${({ fullscreen }) => (fullscreen ? '100%' : '640px')};
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 4px;

  @media only screen and ${breakpoints.tablet} {
    width: 420px;
  }
`;
