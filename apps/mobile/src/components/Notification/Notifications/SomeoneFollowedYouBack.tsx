import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useRef } from 'react';
import { Text } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { NotificationBottomSheetUserList } from '~/components/Notification/NotificationBottomSheetUserList';
import { NotificationSkeleton } from '~/components/Notification/NotificationSkeleton';
import { Typography } from '~/components/Typography';
import { SomeoneFollowedYouBackFragment$key } from '~/generated/SomeoneFollowedYouBackFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';

type SomeoneFollowedYouBackProps = {
  notificationRef: SomeoneFollowedYouBackFragment$key;
};

export function SomeoneFollowedYouBack({ notificationRef }: SomeoneFollowedYouBackProps) {
  const notification = useFragment(
    graphql`
      fragment SomeoneFollowedYouBackFragment on SomeoneFollowedYouBackNotification {
        id
        count

        followers(last: 1) {
          edges {
            node {
              username
            }
          }
        }

        ...NotificationSkeletonFragment
      }
    `,
    notificationRef
  );

  const count = notification.count ?? 1;
  const lastFollower = notification.followers?.edges?.[0]?.node;

  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const bottomSheetRef = useRef<BottomSheetModal | null>(null);
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
    <NotificationSkeleton onPress={handlePress} notificationRef={notification}>
      <Text className="text-sm">
        <Typography
          font={{
            family: 'ABCDiatype',
            weight: 'Bold',
          }}
          className="text-sm"
        >
          {count > 1 ? `${count} collectors` : `${lastFollower?.username ?? 'Someone'}`}
        </Typography>{' '}
        followed you back
      </Text>

      <NotificationBottomSheetUserList
        ref={bottomSheetRef}
        onUserPress={handleUserPress}
        notificationId={notification.id}
      />
    </NotificationSkeleton>
  );
}
