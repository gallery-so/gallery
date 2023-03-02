import { Suspense, useCallback } from 'react';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { USERS_PER_PAGE } from '~/components/NotificationsModal/constants';
import { NotificationUserList } from '~/components/NotificationsModal/NotificationUserList/NotificationUserList';
import { NotificationUserListTitle } from '~/components/NotificationsModal/NotificationUserListTitle';
import { BackButton } from '~/contexts/globalLayout/GlobalNavbar/BackButton';
import { useDrawerActions } from '~/contexts/globalLayout/GlobalSidebar/SidebarDrawerContext';
import { NotificationUserListModalQuery } from '~/generated/NotificationUserListModalQuery.graphql';

import Loader from '../core/Loader/Loader';
import { NotificationsModal } from './NotificationsModal';

type NotificationUserListModalProps = {
  notificationId: string;
  fullscreen: boolean;
};

export function NotificationUserListModal({
  fullscreen,
  notificationId,
}: NotificationUserListModalProps) {
  const query = useLazyLoadQuery<NotificationUserListModalQuery>(
    graphql`
      query NotificationUserListModalQuery(
        $notificationId: ID!
        $notificationUsersLast: Int!
        $notificationUsersBefore: String
      ) {
        ...NotificationUserListFragment
        ...NotificationUserListTitleFragment
      }
    `,
    { notificationId, notificationUsersLast: USERS_PER_PAGE },
    { fetchPolicy: 'store-and-network' }
  );

  const { showDrawer } = useDrawerActions();

  const handleBackClick = useCallback(() => {
    showDrawer({
      content: <NotificationsModal />,
      headerText: 'Notifications',
      drawerName: 'notifications',
    });
  }, [showDrawer]);

  return (
    <ModalContent fullscreen={fullscreen}>
      <Suspense
        fallback={
          <VStack grow justify="center" align="center">
            <Loader size="large" />
          </VStack>
        }
      >
        <StyledHeader>
          <HStack align="center" gap={8}>
            <BackButton onClick={handleBackClick} />
            <ModalTitle>
              <NotificationUserListTitle queryRef={query} />
            </ModalTitle>
          </HStack>
        </StyledHeader>
        <ModalBody>
          <NotificationUserList queryRef={query} />
        </ModalBody>
      </Suspense>
    </ModalContent>
  );
}

const ModalTitle = styled.div`
  padding: 16px 0;
`;

const ModalBody = styled.div`
  padding: 0 4px;
`;

const StyledHeader = styled.div`
  padding: 0 8px;
`;

const ModalContent = styled.div<{ fullscreen: boolean }>`
  height: ${({ fullscreen }) => (fullscreen ? '100%' : '640px')};
  width: ${({ fullscreen }) => (fullscreen ? '100%' : '420px')};
  display: flex;
  flex-direction: column;
`;
