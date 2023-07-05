import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useRef } from 'react';
import { Text } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { GalleryBottomSheetModalType } from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { NotificationBottomSheetUserList } from '~/components/Notification/NotificationBottomSheetUserList';
import { NotificationSkeleton } from '~/components/Notification/NotificationSkeleton';
import { Typography } from '~/components/Typography';
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

  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);
  const handlePress = useCallback(() => {
    if (count > 1) {
      bottomSheetRef.current?.present();
    } else if (lastFollower?.username) {
      navigation.navigate('Profile', { username: lastFollower.username });
    }
  }, [count, lastFollower?.username, navigation]);

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
      responsibleUserRefs={followers}
      notificationRef={notification}
    >
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
        followed you
      </Text>

      <NotificationBottomSheetUserList
        ref={bottomSheetRef}
        onUserPress={handleUserPress}
        notificationId={notification.id}
      />
    </NotificationSkeleton>
  );
}
