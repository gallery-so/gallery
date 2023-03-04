import { Suspense, useCallback } from 'react';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { USERS_PER_PAGE } from '~/components/Notifications/constants';
import { NotificationUserList } from '~/components/Notifications/NotificationUserList/NotificationUserList';
import { NotificationUserListTitle } from '~/components/Notifications/NotificationUserListTitle';
import { BackButton } from '~/contexts/globalLayout/GlobalNavbar/BackButton';
import { NotificationUserListPageQuery } from '~/generated/NotificationUserListPageQuery.graphql';

import Loader from '../core/Loader/Loader';

type NotificationUserListPageProps = {
  notificationId: string;

  toggleSubView: (page?: JSX.Element) => void;
};

export function NotificationUserListPage({
  notificationId,
  toggleSubView,
}: NotificationUserListPageProps) {
  const query = useLazyLoadQuery<NotificationUserListPageQuery>(
    graphql`
      query NotificationUserListPageQuery(
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

  const handleBackClick = useCallback(() => {
    toggleSubView();
  }, [toggleSubView]);

  return (
    <StyledUserList>
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
    </StyledUserList>
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

const StyledUserList = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
`;
