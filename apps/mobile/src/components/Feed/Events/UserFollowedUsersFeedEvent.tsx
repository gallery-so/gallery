import { View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { UserFollowedUsersFeedEventFragment$key } from '~/generated/UserFollowedUsersFeedEventFragment.graphql';

import { Typography } from '../../Typography';

type UserFollowedUsersFeedEventProps = {
  userFollowedUsersFeedEventDataRef: UserFollowedUsersFeedEventFragment$key;
};

export function UserFollowedUsersFeedEvent({
  userFollowedUsersFeedEventDataRef,
}: UserFollowedUsersFeedEventProps) {
  const userFollowedUsersFeedEventData = useFragment(
    graphql`
      fragment UserFollowedUsersFeedEventFragment on UserFollowedUsersFeedEventData {
        __typename
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

  return (
    <View className="flex flex-row space-x-1">
      <Typography font={{ family: 'ABCDiatype', weight: 'Bold' }}>
        {userFollowedUsersFeedEventData.owner?.username}
      </Typography>

      <Typography font={{ family: 'ABCDiatype', weight: 'Bold' }}>followed</Typography>

      <Typography font={{ family: 'ABCDiatype', weight: 'Bold' }}>
        {userFollowedUsersFeedEventData.followed?.[0]?.user?.username}
      </Typography>
    </View>
  );
}
