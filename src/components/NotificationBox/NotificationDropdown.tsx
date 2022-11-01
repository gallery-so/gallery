import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { NotificationDropdownFragment$key } from '__generated__/NotificationDropdownFragment.graphql';
import styled from 'styled-components';
import { VStack } from 'components/core/Spacer/Stack';
import { BaseXL, TitleDiatypeL, TitleXS } from 'components/core/Text/Text';
import { Notification } from './Notification';
import colors from 'components/core/colors';
import { GLOBAL_NAVBAR_HEIGHT } from 'contexts/globalLayout/GlobalNavbar/constants';
import { useMemo } from 'react';

type NotificationDropdownProps = {
  queryRef: NotificationDropdownFragment$key;
};

export function NotificationDropdown({ queryRef }: NotificationDropdownProps) {
  const query = useFragment(
    graphql`
      fragment NotificationDropdownFragment on Query {
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

  console.log(nonNullNotifications);

  const hasNotifications = true;

  return (
    <Container align="center" gap={32}>
      <Title>Notifications</Title>

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
            <TitleDiatypeL>Nothing to see here yet.</TitleDiatypeL>
          </>
        )}
      </NotificationsContent>
    </Container>
  );
}

const NotificationsContent = styled(VStack)`
  width: 100%;
`;

const Title = styled(BaseXL)`
  font-weight: 500;
`;

const Container = styled(VStack)`
  width: 375px;

  // The goal here is to ensure this dropdown stays 16px away from the bottom of the screen
  // To do that, we have to take a few things into account
  //
  //                                       Distance between top of dropdown
  //                                           and bottom of navbar
  //                                                    |
  //                                                    |     |-- Distance from bottom of screen
  //                                                    |     |
  max-height: calc(100vh - ${GLOBAL_NAVBAR_HEIGHT}px - 8px - 16px);
  overflow-y: auto;

  padding: 16px 24px;

  border: 1px solid ${colors.offBlack};
  background-color: ${colors.white};
`;
