import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { NotificationDropdownFragment$key } from '__generated__/NotificationDropdownFragment.graphql';
import styled from 'styled-components';
import { VStack } from 'components/core/Spacer/Stack';
import { BaseXL, TitleDiatypeL } from 'components/core/Text/Text';
import { Notification } from './Notification';
import colors from 'components/core/colors';

type NotificationDropdownProps = {
  queryRef: NotificationDropdownFragment$key;
};

const notifications = [
  {
    kind: 'admired',
    collectionName: 'Ornament, Jan Robert Leegte, 2021',
    seen: false,
    timeAgo: '2m',
  },
  { kind: 'viewed', who: 'Robin', count: 1, seen: false, timeAgo: '2m' },
  {
    kind: 'commented',
    who: 'jess',
    count: 1,
    collectionName: 'Ornament, Jan Robert Leegte, 2021',
    commentText: 'so aesthetic',
    seen: false,
    timeAgo: '8m',
  },
  { kind: 'followed', count: 5 },
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

  const hasNotifications = false;

  return (
    <Container align="center" gap={32}>
      <Title>Notifications</Title>

      <NotificationsContent>
        {hasNotifications ? (
          <>
            {notifications.map((notification, index) => {
              return <Notification key={index} notification={notification} />;
            })}
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

const NotificationsContent = styled.div``;

const Title = styled(BaseXL)`
  font-weight: 500;
`;

const Container = styled(VStack)`
  width: 375px;

  padding: 16px 24px;

  border: 1px solid ${colors.offBlack};
`;
