import { BottomSheetModalProps } from '@gorhom/bottom-sheet';
import { ForwardedRef, forwardRef, Suspense, useCallback, useState } from 'react';
import { View } from 'react-native';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';

import {
  GalleryBottomSheetModal,
  GalleryBottomSheetModalType,
} from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { UserFollowList } from '~/components/UserFollowList/UserFollowList';
import { UserFollowListFallback } from '~/components/UserFollowList/UserFollowListFallback';
import { NotificationBottomSheetUserListQuery } from '~/generated/NotificationBottomSheetUserListQuery.graphql';
import { UserFollowListFragment$key } from '~/generated/UserFollowListFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

export const NotificationBottomSheetUserListQueryNode = graphql`
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
  } else if (query.node?.__typename === 'SomeoneAdmiredYourPostNotification') {
    users = removeNullValues(query.node.admirers?.edges?.map((edge) => edge?.node));
  }

  return (
    <View className="flex-1 bg-white dark:bg-black-900">
      <UserFollowList userRefs={users} queryRef={query} onUserPress={onUserPress} />
    </View>
  );
}

type NotificationBottomSheetUserListProps = NotificationBottomSheetUserListInnerProps &
  Omit<BottomSheetModalProps, 'children' | 'snapPoints'>;

function NotificationBottomSheetUserList(
  { onUserPress, notificationId, ...rest }: NotificationBottomSheetUserListProps,
  ref: ForwardedRef<GalleryBottomSheetModalType>
) {
  const [showing, setShowing] = useState(false);

  // This is to ensure the lazy query doesn't start until the modal is presented
  const handleAnimate = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex === -1) {
        setShowing(true);
      }

      rest?.onAnimate?.(fromIndex, toIndex);
    },
    [rest]
  );

  return (
    <GalleryBottomSheetModal snapPoints={[320]} {...rest} onAnimate={handleAnimate} ref={ref}>
      <Suspense fallback={<UserFollowListFallback />}>
        {showing ? (
          <NotificationBottomSheetUserListInner
            onUserPress={onUserPress}
            notificationId={notificationId}
          />
        ) : (
          <UserFollowListFallback />
        )}
      </Suspense>
    </GalleryBottomSheetModal>
  );
}

const ForwardedNotificationBottomSheetUserList = forwardRef<
  GalleryBottomSheetModalType,
  NotificationBottomSheetUserListProps
>(NotificationBottomSheetUserList);

export { ForwardedNotificationBottomSheetUserList as NotificationBottomSheetUserList };
