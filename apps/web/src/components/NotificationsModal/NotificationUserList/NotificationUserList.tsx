import { NotificationUserListFragment$key } from '__generated__/NotificationUserListFragment.graphql';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { FollowedBackList } from '~/components/NotificationsModal/NotificationUserList/FollowedBackList';
import { FollowedYouList } from '~/components/NotificationsModal/NotificationUserList/FollowedYouList';
import { ViewedUserList } from '~/components/NotificationsModal/NotificationUserList/ViewedUserList';

type NotificationUserListProps = {
  queryRef: NotificationUserListFragment$key;
};

export function NotificationUserList({ queryRef }: NotificationUserListProps) {
  const query = useFragment(
    graphql`
      fragment NotificationUserListFragment on Query {
        node(id: $notificationId) {
          ... on SomeoneViewedYourGalleryNotification {
            __typename
            ...ViewedUserListFragment
          }

          ... on SomeoneFollowedYouBackNotification {
            __typename
            ...FollowedBackListFragment
          }

          ... on SomeoneFollowedYouNotification {
            __typename
            ...FollowedYouListFragment
          }
        }
      }
    `,
    queryRef
  );

  if (query.node?.__typename === 'SomeoneFollowedYouNotification') {
    return <FollowedYouList notificationRef={query.node} />;
  } else if (query.node?.__typename === 'SomeoneViewedYourGalleryNotification') {
    return <ViewedUserList notificationRef={query.node} />;
  } else if (query.node?.__typename === 'SomeoneFollowedYouBackNotification') {
    return <FollowedBackList notificationRef={query.node} />;
  }

  return null;
}
