import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { FollowedBackList } from '~/components/Notifications/NotificationUserList/FollowedBackList';
import { FollowedYouList } from '~/components/Notifications/NotificationUserList/FollowedYouList';
import { ViewedUserList } from '~/components/Notifications/NotificationUserList/ViewedUserList';
import { NotificationUserListFragment$key } from '~/generated/NotificationUserListFragment.graphql';

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
