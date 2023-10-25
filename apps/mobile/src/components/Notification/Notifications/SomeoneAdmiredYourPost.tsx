import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useRef } from 'react';
import { Text, View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { NotificationBottomSheetUserList } from '~/components/Notification/NotificationBottomSheetUserList';
import { GalleryBottomSheetModalType } from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';

import { NotificationSkeleton } from '~/components/Notification/NotificationSkeleton';
import { Typography } from '~/components/Typography';
import { SomeoneAdmiredYourPostFragment$key } from '~/generated/SomeoneAdmiredYourPostFragment.graphql';
import { SomeoneAdmiredYourPostQueryFragment$key } from '~/generated/SomeoneAdmiredYourPostQueryFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import { contexts } from '~/shared/analytics/constants';

type SomeoneAdmiredYourFeedEventProps = {
  queryRef: SomeoneAdmiredYourPostQueryFragment$key;
  notificationRef: SomeoneAdmiredYourPostFragment$key;
};

export function SomeoneAdmiredYourPost({
  notificationRef,
  queryRef,
}: SomeoneAdmiredYourFeedEventProps) {
  const query = useFragment(
    graphql`
      fragment SomeoneAdmiredYourPostQueryFragment on Query {
        ...NotificationSkeletonQueryFragment
      }
    `,
    queryRef
  );

  const notification = useFragment(
    graphql`
      fragment SomeoneAdmiredYourPostFragment on SomeoneAdmiredYourPostNotification {
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
        post {
          dbid
        }

        ...NotificationSkeletonFragment
      }
    `,
    notificationRef
  );

  const { post } = notification;

  const admirers = useMemo(() => {
    return removeNullValues(notification.admirers?.edges?.map((edge) => edge?.node));
  }, [notification.admirers?.edges]);

  const count = notification.count ?? 1;
  const firstAdmirer = admirers[0];
  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);

  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const handlePress = useCallback(() => {
    if (post?.dbid) {
      navigation.navigate('Post', { postId: post.dbid });
    }
  }, [navigation, post?.dbid]);

  const handleAdmirersPress = useCallback(() => {
    if (count > 1) {
      bottomSheetRef.current?.present();
    } else if (firstAdmirer?.username) {
      navigation.navigate('Profile', { username: firstAdmirer.username });
    }
  }, [firstAdmirer?.username, navigation, count]);

  const handleUserPress = useCallback(
    (username: string) => {
      bottomSheetRef.current?.dismiss();
      navigation.navigate('Profile', { username });
    },
    [navigation]
  );

  return (
    <NotificationSkeleton
      queryRef={query}
      onPress={handlePress}
      responsibleUserRefs={admirers}
      notificationRef={notification}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
            post
          </Typography>
        </Text>
      </View>
    </NotificationSkeleton>
  );
}
