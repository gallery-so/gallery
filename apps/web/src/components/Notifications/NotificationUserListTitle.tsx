import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { TitleDiatypeM } from '~/components/core/Text/Text';
import { NotificationUserListTitleFragment$key } from '~/generated/NotificationUserListTitleFragment.graphql';

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
      return 'Gallery views';
    }

    // Sane fallback
    return 'Collectors';
  }, [query.node?.__typename]);

  return <TitleDiatypeM>{title}</TitleDiatypeM>;
}
