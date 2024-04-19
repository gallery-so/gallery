import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import { useReportError } from 'shared/contexts/ErrorReportingContext';
import { getTimeSince } from 'shared/utils/time';

import { BaseM, BaseS } from '~/components/Text';
import { SomeoneYouFollowOnFarcasterJoinedFragment$key } from '~/generated/SomeoneYouFollowOnFarcasterJoinedFragment.graphql';
import { SomeoneYouFollowOnFarcasterJoinedQueryFragment$key } from '~/generated/SomeoneYouFollowOnFarcasterJoinedQueryFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';

import { NotificationSkeleton } from '../NotificationSkeleton';

type SomeoneYouFollowOnFarcasterJoinedProps = {
  queryRef: SomeoneYouFollowOnFarcasterJoinedQueryFragment$key;
  notificationRef: SomeoneYouFollowOnFarcasterJoinedFragment$key;
};

export default function SomeoneYouFollowOnFarcasterJoined({
  queryRef,
  notificationRef,
}: SomeoneYouFollowOnFarcasterJoinedProps) {
  const query = useFragment(
    graphql`
      fragment SomeoneYouFollowOnFarcasterJoinedQueryFragment on Query {
        ...NotificationSkeletonQueryFragment
      }
    `,
    queryRef
  );
  const notification = useFragment(
    graphql`
      fragment SomeoneYouFollowOnFarcasterJoinedFragment on SomeoneYouFollowOnFarcasterJoinedNotification {
        ...NotificationSkeletonFragment
        updatedTime
        user {
          username
          ...NotificationSkeletonResponsibleUsersFragment
        }
      }
    `,
    notificationRef
  );
  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const reportError = useReportError();
  const handlePress = useCallback(() => {
    if (!notification.user?.username) {
      return;
    }
    navigation.navigate('Profile', { username: notification.user.username });
  }, [navigation, notification.user?.username]);

  if (!notification.user) {
    reportError(new Error('SomeoneYouFollowOnFarcasterJoined notification is missing user'));
    return null;
  }

  const username = notification.user.username ?? '';

  return (
    <NotificationSkeleton
      queryRef={query}
      onPress={handlePress}
      notificationRef={notification}
      responsibleUserRefs={[notification.user]}
      shouldShowFollowBackButton
    >
      <View className="flex space-y-0.5">
        <View className="flex flex-row pt-1 items-baseline flex-wrap">
          <BaseM weight="Bold">{username} </BaseM>
          <BaseM>just joined </BaseM>
          <BaseS classNameOverride="text-metal">{getTimeSince(notification.updatedTime)}</BaseS>
        </View>
        <BaseS>You know {username} from Farcaster</BaseS>
      </View>
    </NotificationSkeleton>
  );
}
