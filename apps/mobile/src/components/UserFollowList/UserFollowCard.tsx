import { useCallback } from 'react';
import { View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { FollowButton } from '~/components/FollowButton';
import { Markdown } from '~/components/Markdown';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { Typography } from '~/components/Typography';
import { UserFollowCardFragment$key } from '~/generated/UserFollowCardFragment.graphql';
import { UserFollowCardQueryFragment$key } from '~/generated/UserFollowCardQueryFragment.graphql';

import isFeatureEnabled, { FeatureFlag } from '../../utils/isFeatureEnabled';
import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';

type UserFollowCardProps = {
  userRef: UserFollowCardFragment$key;
  queryRef: UserFollowCardQueryFragment$key;
  onPress: (username: string) => void;
};

export function UserFollowCard({ userRef, queryRef, onPress }: UserFollowCardProps) {
  const query = useFragment(
    graphql`
      fragment UserFollowCardQueryFragment on Query {
        ...FollowButtonQueryFragment
        ...isFeatureEnabledFragment
      }
    `,
    queryRef
  );

  const user = useFragment(
    graphql`
      fragment UserFollowCardFragment on GalleryUser {
        username
        bio

        ...ProfilePictureFragment
        ...FollowButtonUserFragment
      }
    `,
    userRef
  );

  const bioFirstLine = user.bio?.split('\n')[0];

  const isPfpEnabled = isFeatureEnabled(FeatureFlag.PFP, query);

  const handlePress = useCallback(() => {
    if (user.username) {
      onPress(user.username);
    }
  }, [onPress, user.username]);

  return (
    <View className="flex w-full flex-row items-center justify-between space-x-8 overflow-hidden py-3 px-4 h-16">
      <GalleryTouchableOpacity
        onPress={handlePress}
        className="flex flex-1 flex-grow flex-col h-full space-y-1"
        eventElementId="User Follow Username"
        eventName="User Follow Username Clicked"
      >
        <View className="flex flex-row items-center space-x-2">
          {isPfpEnabled && <ProfilePicture userRef={user} size="sm" />}

          <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
            {user.username}
          </Typography>
        </View>

        <View>
          <Markdown numberOfLines={1}>{bioFirstLine}</Markdown>
        </View>
      </GalleryTouchableOpacity>

      <FollowButton queryRef={query} userRef={user} />
    </View>
  );
}
