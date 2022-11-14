import { Suspense } from 'react';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { USERS_PER_PAGE } from '~/components/NotificationsModal/constants';
import { NotificationUserList } from '~/components/NotificationsModal/NotificationUserList/NotificationUserList';
import { NotificationUserListTitle } from '~/components/NotificationsModal/NotificationUserListTitle';
import { MODAL_PADDING_PX } from '~/contexts/modal/constants';
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

  return (
    <ModalContent fullscreen={fullscreen}>
      <StyledHeader>
        <Suspense fallback={null}>
          <NotificationUserListTitle queryRef={query} />
        </Suspense>
      </StyledHeader>

      <Suspense fallback={null}>
        <NotificationUserList queryRef={query} />
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
