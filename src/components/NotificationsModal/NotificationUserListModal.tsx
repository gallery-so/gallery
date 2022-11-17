import { Suspense } from 'react';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { HStack } from '~/components/core/Spacer/Stack';
import { TitleDiatypeM } from '~/components/core/Text/Text';
import { USERS_PER_PAGE } from '~/components/NotificationsModal/constants';
import { NotificationUserList } from '~/components/NotificationsModal/NotificationUserList/NotificationUserList';
import { NotificationUserListTitle } from '~/components/NotificationsModal/NotificationUserListTitle';
import { BackButton } from '~/contexts/globalLayout/GlobalNavbar/BackButton';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { NotificationUserListModalQuery } from '~/generated/NotificationUserListModalQuery.graphql';

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
    { notificationId, notificationUsersLast: USERS_PER_PAGE }
  );

  const { hideModal } = useModalActions();

  return (
    <ModalContent fullscreen={fullscreen}>
      <StyledHeader>
        <HStack align="center" gap={8}>
          <BackButton onClick={hideModal} />
          <ModalTitle>
            <Suspense fallback={<TitleDiatypeM>...</TitleDiatypeM>}>
              <NotificationUserListTitle queryRef={query} />
            </Suspense>
          </ModalTitle>
        </HStack>
      </StyledHeader>

      <Suspense fallback={null}>
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
