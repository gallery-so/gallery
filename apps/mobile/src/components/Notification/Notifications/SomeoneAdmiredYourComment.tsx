import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useRef } from 'react';
import { Text, View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { GalleryBottomSheetModalType } from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { NotificationBottomSheetUserList } from '~/components/Notification/NotificationBottomSheetUserList';
import { NotificationSkeleton } from '~/components/Notification/NotificationSkeleton';
import { Typography } from '~/components/Typography';
import { SomeoneAdmiredYourCommentFragment$key } from '~/generated/SomeoneAdmiredYourCommentFragment.graphql';
import { SomeoneAdmiredYourCommentQueryFragment$key } from '~/generated/SomeoneAdmiredYourCommentQueryFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { contexts } from '~/shared/analytics/constants';
import { removeNullValues } from '~/shared/relay/removeNullValues';

type SomeoneFollowedYouProps = {
  queryRef: SomeoneAdmiredYourCommentQueryFragment$key;
  notificationRef: SomeoneAdmiredYourCommentFragment$key;
};

export function SomeoneAdmiredYourComment({ notificationRef, queryRef }: SomeoneFollowedYouProps) {
  const query = useFragment(
    graphql`
      fragment SomeoneAdmiredYourCommentQueryFragment on Query {
        ...NotificationSkeletonQueryFragment
      }
    `,
    queryRef
  );

  const notification = useFragment(
    graphql`
      fragment SomeoneAdmiredYourCommentFragment on SomeoneAdmiredYourCommentNotification {
        id
        count
        admirers(last: 1) {
          edges {
            node {
              __typename
              username

              ...NotificationSkeletonResponsibleUsersFragment
            }
          }
        }
        comment {
          dbid
          comment
          deleted
          source {
            ... on Post {
              id
              dbid
            }
            ... on FeedEvent {
              id
              dbid
            }
          }
        }

        ...NotificationSkeletonFragment
      }
    `,
    notificationRef
  );

  const admirers = useMemo(() => {
    return removeNullValues(notification.admirers?.edges?.map((edge) => edge?.node));
  }, [notification.admirers?.edges]);

  const count = notification.count ?? 1;
  const firstAdmirer = admirers[0];
  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);

  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const handlePress = useCallback(() => {
    if (notification.comment?.source?.dbid) {
      navigation.navigate('Post', {
        postId: notification.comment.source.dbid,
        commentId: notification.comment.dbid,
      });
    }
  }, [navigation, notification.comment?.dbid, notification.comment?.source?.dbid]);

  const handleUserPress = useCallback(
    (username: string) => {
      bottomSheetRef.current?.dismiss();
      navigation.navigate('Profile', { username });
    },
    [navigation]
  );

  const handleAdmirersPress = useCallback(() => {
    if (count > 1) {
      bottomSheetRef.current?.present();
    } else if (firstAdmirer?.username) {
      navigation.navigate('Profile', { username: firstAdmirer.username });
    }
  }, [firstAdmirer?.username, navigation, count]);

  return (
    <NotificationSkeleton
      queryRef={query}
      onPress={handlePress}
      responsibleUserRefs={admirers}
      notificationRef={notification}
    >
      <View className="flex space-y-0.5">
        <View className="flex-row items-center">
          <GalleryTouchableOpacity
            onPress={handleAdmirersPress}
            eventName={null}
            eventElementId={null}
            eventContext={contexts['Notifications']}
          >
            <Text>
              <Typography
                font={{
                  family: 'ABCDiatype',
                  weight: 'Bold',
                }}
                className="text-sm"
              >
                {count > 1
                  ? `${notification.count} collectors`
                  : firstAdmirer
                  ? firstAdmirer?.username
                  : 'Someone'}
              </Typography>
              <NotificationBottomSheetUserList
                ref={bottomSheetRef}
                onUserPress={handleUserPress}
                notificationId={notification.id}
              />
            </Text>
          </GalleryTouchableOpacity>
          <Text>
            {' '}
            <Typography
              font={{
                family: 'ABCDiatype',
                weight: 'Regular',
              }}
              className="text-sm"
            >
              admired your
            </Typography>{' '}
            <Typography
              font={{
                family: 'ABCDiatype',
                weight: 'Bold',
              }}
              className="text-sm"
            >
              comment
            </Typography>
          </Text>
        </View>

        {!notification.comment?.deleted && (
          <View className="border-l-2 border-[#d9d9d9] pl-2 px-2 w-64">
            <Text className="dark:text-white" numberOfLines={3}>
              {notification.comment?.comment ?? ''}
            </Text>
          </View>
        )}
      </View>
    </NotificationSkeleton>
  );
}
