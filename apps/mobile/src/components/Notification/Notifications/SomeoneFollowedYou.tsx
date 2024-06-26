import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import NotificationBottomSheetUserList from '~/components/Notification/NotificationBottomSheetUserList';
import { NotificationSkeleton } from '~/components/Notification/NotificationSkeleton';
import { Typography } from '~/components/Typography';
import { useBottomSheetModalActions } from '~/contexts/BottomSheetModalContext';
import { SomeoneFollowedYouFragment$key } from '~/generated/SomeoneFollowedYouFragment.graphql';
import { SomeoneFollowedYouQueryFragment$key } from '~/generated/SomeoneFollowedYouQueryFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { removeNullValues } from '~/shared/relay/removeNullValues';

type SomeoneFollowedYouProps = {
  queryRef: SomeoneFollowedYouQueryFragment$key;
  notificationRef: SomeoneFollowedYouFragment$key;
};

export function SomeoneFollowedYou({ notificationRef, queryRef }: SomeoneFollowedYouProps) {
  const query = useFragment(
    graphql`
      fragment SomeoneFollowedYouQueryFragment on Query {
        viewer {
          ... on Viewer {
            user {
              id
              following {
                id
              }
            }
          }
        }
        ...NotificationSkeletonQueryFragment
      }
    `,
    queryRef
  );

  const notification = useFragment(
    graphql`
      fragment SomeoneFollowedYouFragment on SomeoneFollowedYouNotification {
        id
        count

        followers(last: 1) {
          edges {
            node {
              username

              ...NotificationSkeletonResponsibleUsersFragment
              ... on GalleryUser {
                dbid
              }
            }
          }
        }

        ...NotificationSkeletonFragment
      }
    `,
    notificationRef
  );

  const followers = useMemo(() => {
    return removeNullValues(notification.followers?.edges?.map((edge) => edge?.node));
  }, [notification.followers?.edges]);

  const count = notification.count ?? 1;
  const lastFollower = notification.followers?.edges?.[0]?.node;

  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const { showBottomSheetModal, hideBottomSheetModal } = useBottomSheetModalActions();

  const handleUserPress = useCallback(
    (username: string) => {
      hideBottomSheetModal();
      navigation.navigate('Profile', { username });
    },
    [hideBottomSheetModal, navigation]
  );

  const handlePress = useCallback(() => {
    if (count > 1) {
      showBottomSheetModal({
        content: (
          <NotificationBottomSheetUserList
            onUserPress={handleUserPress}
            notificationId={notification.id}
          />
        ),
      });
    } else if (lastFollower?.username) {
      navigation.navigate('Profile', { username: lastFollower.username });
    }
  }, [
    count,
    handleUserPress,
    lastFollower?.username,
    navigation,
    notification.id,
    showBottomSheetModal,
  ]);

  const isFollowingBack = useMemo(() => {
    const followingList = new Set(
      (query.viewer?.user?.following ?? []).map((following: { id: string } | null) =>
        following?.id?.replace('GalleryUser:', '')
      )
    );
    const lastFollowerUser = notification.followers?.edges?.[0];
    if (lastFollowerUser && !followingList.has(lastFollowerUser.node?.dbid)) {
      return true;
    }
    return false;
  }, [query.viewer?.user?.following, notification.followers?.edges]);

  const [isInitiallyFollowingBack] = useState(isFollowingBack);
  const shouldShowFollowBackButton =
    count === 1 && lastFollower && (isInitiallyFollowingBack || isFollowingBack);

  return (
    <NotificationSkeleton
      queryRef={query}
      onPress={handlePress}
      shouldShowFollowBackButton={shouldShowFollowBackButton ?? false}
      responsibleUserRefs={followers}
      notificationRef={notification}
    >
      <View className="flex flex-row w-full justify-between items-center">
        <View className="max-w-[180px]">
          <Text>
            <Typography
              font={{
                family: 'ABCDiatype',
                weight: 'Bold',
              }}
              className="text-sm"
            >
              {count > 1 ? (
                `${count} collectors`
              ) : (
                <>{lastFollower ? lastFollower.username : 'Someone'}</>
              )}
            </Typography>{' '}
            <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
              followed
            </Typography>{' '}
            <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
              you
            </Typography>
          </Text>
        </View>
      </View>
    </NotificationSkeleton>
  );
}
