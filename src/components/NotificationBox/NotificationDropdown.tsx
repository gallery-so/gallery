import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { NotificationDropdownFragment$key } from '__generated__/NotificationDropdownFragment.graphql';
import styled from 'styled-components';
import { VStack } from 'components/core/Spacer/Stack';
import { BaseXL, TitleDiatypeL, TitleXS } from 'components/core/Text/Text';
import { Notification } from './Notification';
import colors from 'components/core/colors';
import { GLOBAL_NAVBAR_HEIGHT } from 'contexts/globalLayout/GlobalNavbar/constants';

type NotificationDropdownProps = {
  queryRef: NotificationDropdownFragment$key;
};

const notifications = [
  {
    kind: 'admired',
    who: 'robin',
    collectionName: 'Ornament, Jan Robert Leegte, 2021',
    seen: false,
    timeAgo: '2m',
    count: 1,
  },
  { kind: 'viewed', who: 'robin', count: 1, seen: false, timeAgo: '2m' },
  {
    kind: 'commented',
    who: 'jess',
    count: 1,
    collectionName: 'Ornament, Jan Robert Leegte, 2021',
    commentText: 'so aesthetic',
    seen: false,
    timeAgo: '8m',
  },
  { kind: 'followed', count: 5, seen: true, timeAgo: '1d', who: 'robin' },
  {
    kind: 'commented',
    who: 'robin',
    count: 1,
    collectionName: 'Ornament, Jan Robert Leegte, 2021',
    commentText: 'so aesthetic',
    seen: true,
    timeAgo: '1d',
  },
  {
    kind: 'commented',
    who: 'kaito',
    count: 1,
    collectionName: 'Ornament, Jan Robert Leegte, 2021',
    commentText: 'so aesthetic',
    seen: true,
    timeAgo: '1d',
  },
  {
    kind: 'commented',
    who: 'mikey',
    count: 1,
    collectionName: 'Ornament, Jan Robert Leegte, 2021',
    commentText: 'so aesthetic',
    seen: true,
    timeAgo: '1d',
  },
  {
    kind: 'commented',
    who: 'terence',
    count: 1,
    collectionName: 'Ornament, Jan Robert Leegte, 2021',
    commentText: 'ayy yooo',
    seen: true,
    timeAgo: '1d',
  },
  {
    kind: 'commented',
    who: 'jrl',
    count: 1,
    collectionName: 'Ornament, Jan Robert Leegte, 2021',
    commentText: 'so dope',
    seen: true,
    timeAgo: '1d',
  },
] as const;

export type NotificationType = typeof notifications[number];

export function NotificationDropdown({ queryRef }: NotificationDropdownProps) {
  const query = useFragment(
    graphql`
      fragment NotificationDropdownFragment on Query {
        viewer {
          ... on Viewer {
            user {
              dbid
            }
          }
        }
      }
    `,
    queryRef
  );

  const hasNotifications = true;

  return (
    <Container align="center" gap={32}>
      <Title>Notifications</Title>

      <NotificationsContent grow>
        {hasNotifications ? (
          <>
            {notifications.map((notification) => {
              return <Notification notification={notification} />;
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
