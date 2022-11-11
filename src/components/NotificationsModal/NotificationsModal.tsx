import { Suspense, useEffect } from 'react';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { TitleDiatypeM } from '~/components/core/Text/Text';
import {
  NotificationList,
  NOTIFICATIONS_PER_PAGE,
} from '~/components/NotificationsModal/NotificationList';
import { useClearNotifications } from '~/components/NotificationsModal/useClearNotifications';
import { MODAL_PADDING_PX } from '~/contexts/modal/constants';
import { NotificationsModalQuery } from '~/generated/NotificationsModalQuery.graphql';

type NotificationsModalProps = {
  fullscreen: boolean;
};

export function NotificationsModal({ fullscreen }: NotificationsModalProps) {
  const query = useLazyLoadQuery<NotificationsModalQuery>(
    graphql`
      query NotificationsModalQuery($notificationsLast: Int!, $notificationsBefore: String) {
        ...NotificationListFragment
      }
    `,
    { notificationsLast: NOTIFICATIONS_PER_PAGE }
  );

  const clearAllNotifications = useClearNotifications();

  useEffect(() => {
    // When they close the modal, clear their notifications
    return () => {
      clearAllNotifications();
    };
  }, [clearAllNotifications]);

  return (
    <ModalContent fullscreen={fullscreen}>
      <StyledHeader>
        <TitleDiatypeM>Notifications</TitleDiatypeM>
      </StyledHeader>

      <Suspense fallback={null}>
        <NotificationList queryRef={query} />
      </Suspense>
    </ModalContent>
  );
}

const StyledHeader = styled.div`
  padding-bottom: ${MODAL_PADDING_PX}px;
  padding-left: 12px;
`;

const ModalContent = styled.div<{ fullscreen: boolean }>`
  height: ${({ fullscreen }) => (fullscreen ? '100%' : '640px')};
  width: ${({ fullscreen }) => (fullscreen ? '100%' : '420px')};
  display: flex;
  flex-direction: column;
  padding: ${MODAL_PADDING_PX}px 4px;
`;
