import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { NotificationsModalFragment$key } from '__generated__/NotificationsModalFragment.graphql';
import { VStack } from 'components/core/Spacer/Stack';
import styled from 'styled-components';
import { MODAL_PADDING_THICC_PX } from 'contexts/modal/constants';
import { TitleDiatypeL, TitleDiatypeM, TitleXS } from 'components/core/Text/Text';
import { Notification } from 'components/NotificationsModal/Notification';
import { useMemo } from 'react';

type NotificationsModalProps = {
  queryRef: NotificationsModalFragment$key;
  fullscreen: boolean;
};

export function NotificationsModal({ queryRef, fullscreen }: NotificationsModalProps) {
  const query = useFragment(
    graphql`
      fragment NotificationsModalFragment on Query {
        viewer {
          ... on Viewer {
            notifications(last: 10) {
              edges {
                node {
                  id
                  ...NotificationFragment
                }
              }
            }
          }
        }

        ...NotificationDropdownFragment
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

    return notifications;
  }, [query.viewer?.notifications?.edges]);

  const hasNotifications = nonNullNotifications.length > 0;

  return (
    <ModalContent fullscreen={fullscreen}>
      <VStack>
        <StyledHeader>
          <TitleDiatypeM>Notifications</TitleDiatypeM>
        </StyledHeader>
        <NotificationsContent grow>
          {hasNotifications ? (
            <>
              {nonNullNotifications.map((notification) => {
                return <Notification key={notification.id} notificationRef={notification} />;
              })}
              <div>
                <TitleXS>See more</TitleXS>
              </div>
            </>
          ) : (
            <>
              <EmptyNotificationsText>Nothing to see here yet.</EmptyNotificationsText>
            </>
          )}
        </NotificationsContent>
      </VStack>
    </ModalContent>
  );
}
const EmptyNotificationsText = styled(TitleDiatypeL)`
  text-align: center;
`;

const NotificationsContent = styled(VStack)`
  margin-top: 24px;
  width: 100%;
`;

const StyledHeader = styled.div`
  padding-bottom: ${MODAL_PADDING_THICC_PX}px;
  padding-left: 12px;
`;

const ModalContent = styled.div<{ fullscreen: boolean }>`
  height: ${({ fullscreen }) => (fullscreen ? '100%' : '640px')};
  width: ${({ fullscreen }) => (fullscreen ? '100%' : '375px')};
  display: flex;
  flex-direction: column;
  padding: ${MODAL_PADDING_THICC_PX}px 8px;
`;
