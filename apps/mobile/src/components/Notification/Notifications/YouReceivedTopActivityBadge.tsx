import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { Text, View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { TopMemberBadgeIcon } from 'src/icons/TopMemberBadgeIcon';

import { NotificationSkeleton } from '~/components/Notification/NotificationSkeleton';
import { Typography } from '~/components/Typography';
import { YouReceivedTopActivityBadgeFragment$key } from '~/generated/YouReceivedTopActivityBadgeFragment.graphql';
import { YouReceivedTopActivityBadgeQueryFragment$key } from '~/generated/YouReceivedTopActivityBadgeQueryFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';

type YouReceivedTopActivityBadgeProps = {
  queryRef: YouReceivedTopActivityBadgeQueryFragment$key;
  notificationRef: YouReceivedTopActivityBadgeFragment$key;
};

export function YouReceivedTopActivityBadge({
  queryRef,
  notificationRef,
}: YouReceivedTopActivityBadgeProps) {
  const query = useFragment(
    graphql`
      fragment YouReceivedTopActivityBadgeQueryFragment on Query {
        viewer {
          ... on Viewer {
            user {
              username
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
      fragment YouReceivedTopActivityBadgeFragment on YouReceivedTopActivityBadgeNotification {
        __typename

        ...NotificationSkeletonFragment
      }
    `,
    notificationRef
  );

  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const username = query.viewer?.user?.username;
  const handlePress = useCallback(() => {
    if (!username) {
      return;
    }
    navigation.navigate('Profile', { username });
  }, [navigation, username]);

  return (
    <NotificationSkeleton
      queryRef={query}
      onPress={handlePress}
      responsibleUserRefs={[]}
      notificationRef={notification}
      overridePfpElement={
        <View className="h-8 w-8 rounded-full border border-activeBlue items-center justify-center">
          <TopMemberBadgeIcon />
        </View>
      }
    >
      <View className="flex">
        <Text className="dark:text-white">
          <Typography
            font={{
              family: 'ABCDiatype',
              weight: 'Regular',
            }}
            className="text-sm"
          >
            You received a new badge for being amongst the top active users on Gallery this week!
          </Typography>
        </Text>
      </View>
    </NotificationSkeleton>
  );
}
