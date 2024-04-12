import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { Text, View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import NotificationBottomSheetUserList from '~/components/Notification/NotificationBottomSheetUserList';
import { NotificationSkeleton } from '~/components/Notification/NotificationSkeleton';
import { Typography } from '~/components/Typography';
import { useBottomSheetModalActions } from '~/contexts/BottomSheetModalContext';
import { SomeoneAdmiredYourPostFragment$key } from '~/generated/SomeoneAdmiredYourPostFragment.graphql';
import { SomeoneAdmiredYourPostQueryFragment$key } from '~/generated/SomeoneAdmiredYourPostQueryFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { contexts } from '~/shared/analytics/constants';
import { removeNullValues } from '~/shared/relay/removeNullValues';

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

  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const handlePress = useCallback(() => {
    if (post?.dbid) {
      navigation.navigate('Post', { postId: post.dbid });
    }
  }, [navigation, post?.dbid]);

  const { showBottomSheetModal, hideBottomSheetModal } = useBottomSheetModalActions();

  const handleUserPress = useCallback(
    (username: string) => {
      hideBottomSheetModal();
      navigation.navigate('Profile', { username });
    },
    [hideBottomSheetModal, navigation]
  );

  const handleAdmirersPress = useCallback(() => {
    if (count > 1) {
      showBottomSheetModal({
        content: (
          <NotificationBottomSheetUserList
            onUserPress={handleUserPress}
            notificationId={notification.id}
          />
        ),
      });
    } else if (firstAdmirer?.username) {
      navigation.navigate('Profile', { username: firstAdmirer.username });
    }
  }, [
    count,
    firstAdmirer?.username,
    showBottomSheetModal,
    handleUserPress,
    notification.id,
    navigation,
  ]);

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
