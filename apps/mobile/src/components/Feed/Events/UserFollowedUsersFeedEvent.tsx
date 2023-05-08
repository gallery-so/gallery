import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { UserFollowedUsersFeedEventFragment$key } from '~/generated/UserFollowedUsersFeedEventFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { getTimeSince } from '~/shared/utils/time';

import { Typography } from '../../Typography';

type UserFollowedUsersFeedEventProps = {
  userFollowedUsersFeedEventDataRef: UserFollowedUsersFeedEventFragment$key;
};

export function UserFollowedUsersFeedEvent({
  userFollowedUsersFeedEventDataRef,
}: UserFollowedUsersFeedEventProps) {
  const eventData = useFragment(
    graphql`
      fragment UserFollowedUsersFeedEventFragment on UserFollowedUsersFeedEventData {
        __typename
        eventTime

        owner {
          username
        }
        followed {
          user {
            username
          }
        }
      }
    `,
    userFollowedUsersFeedEventDataRef
  );

  const followerUsername = eventData.owner?.username;
  const followeeUsername = eventData.followed?.[0]?.user?.username;

  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const handleFollowerPress = useCallback(() => {
    if (followerUsername) {
      navigation.push('Profile', { username: followerUsername });
    }
  }, [followerUsername, navigation]);

  const handleFolloweePress = useCallback(() => {
    if (followeeUsername) {
      navigation.push('Profile', { username: followeeUsername });
    }
  }, [followeeUsername, navigation]);

  return (
    <View className="flex flex-row justify-between items-center px-3">
      <View className="flex flex-row space-x-1">
        <TouchableOpacity onPress={handleFollowerPress}>
          <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
            {followerUsername}
          </Typography>
        </TouchableOpacity>

        <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
          followed
        </Typography>

        <TouchableOpacity onPress={handleFolloweePress}>
          <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
            {followeeUsername}
          </Typography>
        </TouchableOpacity>
      </View>

      <View>
        <Typography
          className="text-metal text-xs"
          font={{ family: 'ABCDiatype', weight: 'Regular' }}
        >
          {getTimeSince(eventData.eventTime)}
        </Typography>
      </View>
    </View>
  );
}
