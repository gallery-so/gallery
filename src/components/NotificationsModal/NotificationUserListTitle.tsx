import { NotificationUserListTitleFragment$key } from '__generated__/NotificationUserListTitleFragment.graphql';
import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { BaseS } from '~/components/core/Text/Text';

type NotificationUserListTitleProps = {
  queryRef: NotificationUserListTitleFragment$key;
};

export function NotificationUserListTitle({ queryRef }: NotificationUserListTitleProps) {
  const query = useFragment(
    graphql`
      fragment NotificationUserListTitleFragment on Query {
        node(id: $notificationId) {
          ... on SomeoneFollowedYouNotification {
            __typename
          }
          ... on SomeoneFollowedYouBackNotification {
            __typename
          }

          ... on SomeoneViewedYourGalleryNotification {
            __typename
          }

          ... on SomeoneAdmiredYourFeedEventNotification {
            __typename
          }
        }
      }
    `,
    queryRef
  );

  const title = useMemo(() => {
    const typename = query.node?.__typename;

    if (typename === 'SomeoneFollowedYouNotification') {
      return 'Follows';
    } else if (typename === 'SomeoneFollowedYouBackNotification') {
      return 'Follows';
    } else if (typename === 'SomeoneAdmiredYourFeedEventNotification') {
      return 'Admirers';
    } else if (typename === 'SomeoneViewedYourGalleryNotification') {
      return 'Gallery Views';
    }

    // Sane fallback
    return 'Collectors';
  }, [query.node?.__typename]);

  return <BaseS>{title.toUpperCase()}</BaseS>;
}
