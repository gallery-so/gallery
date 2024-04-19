import { BottomSheetModalProps } from '@gorhom/bottom-sheet';
import { Suspense } from 'react';
import { View } from 'react-native';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';

import { UserFollowList } from '~/components/UserFollowList/UserFollowList';
import { UserFollowListFallback } from '~/components/UserFollowList/UserFollowListFallback';
import { NotificationBottomSheetUserListQuery } from '~/generated/NotificationBottomSheetUserListQuery.graphql';
import { UserFollowListFragment$key } from '~/generated/UserFollowListFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

const NotificationBottomSheetUserListQueryNode = graphql`
  query NotificationBottomSheetUserListQuery($notificationId: ID!) {
    node(id: $notificationId) {
      ... on SomeoneViewedYourGalleryNotification {
        __typename
        userViewers(last: 50) {
          edges {
            node {
              ...UserFollowListFragment
            }
          }
        }
      }

      ... on SomeoneFollowedYouBackNotification {
        __typename
        followers(last: 50) {
          edges {
            node {
              ...UserFollowListFragment
            }
          }
        }
      }

      ... on SomeoneFollowedYouNotification {
        __typename
        followers(last: 50) {
          edges {
            node {
              ...UserFollowListFragment
            }
          }
        }
      }

      ... on SomeoneAdmiredYourPostNotification {
        __typename
        admirers(last: 50) {
          edges {
            node {
              ...UserFollowListFragment
            }
          }
        }
      }

      ... on SomeoneAdmiredYourCommentNotification {
        __typename
        admirers(last: 50) {
          edges {
            node {
              ...UserFollowListFragment
            }
          }
        }
      }
    }

    ...UserFollowListQueryFragment
  }
`;

type NotificationBottomSheetUserListInnerProps = {
  onUserPress: (username: string) => void;
  notificationId: string;
};

function NotificationBottomSheetUserListInner({
  notificationId,
  onUserPress,
}: NotificationBottomSheetUserListInnerProps) {
  const query = useLazyLoadQuery<NotificationBottomSheetUserListQuery>(
    NotificationBottomSheetUserListQueryNode,
    { notificationId }
  );

  let users: UserFollowListFragment$key = [];
  if (
    query.node?.__typename === 'SomeoneFollowedYouBackNotification' ||
    query.node?.__typename === 'SomeoneFollowedYouNotification'
  ) {
    users = removeNullValues(query.node.followers?.edges?.map((edge) => edge?.node));
  } else if (query.node?.__typename === 'SomeoneViewedYourGalleryNotification') {
    users = removeNullValues(query.node.userViewers?.edges?.map((edge) => edge?.node));
  } else if (
    query.node?.__typename === 'SomeoneAdmiredYourPostNotification' ||
    query.node?.__typename === 'SomeoneAdmiredYourCommentNotification'
  ) {
    users = removeNullValues(query.node.admirers?.edges?.map((edge) => edge?.node));
  }

  return (
    <View className="flex h-full bg-white dark:bg-black-900 min-h-[180px]">
      <UserFollowList userRefs={users} queryRef={query} onUserPress={onUserPress} />
    </View>
  );
}

type NotificationBottomSheetUserListProps = NotificationBottomSheetUserListInnerProps &
  Omit<BottomSheetModalProps, 'children' | 'snapPoints'>;

export default function NotificationBottomSheetUserList({
  onUserPress,
  notificationId,
}: NotificationBottomSheetUserListProps) {
  return (
    <Suspense fallback={<UserFollowListFallback />}>
      <NotificationBottomSheetUserListInner
        onUserPress={onUserPress}
        notificationId={notificationId}
      />
    </Suspense>
  );
}
