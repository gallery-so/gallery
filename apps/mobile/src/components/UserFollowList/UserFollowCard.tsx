import { useCallback } from 'react';
import { View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { FollowButton } from '~/components/FollowButton';
import { Markdown } from '~/components/Markdown';
import { Typography } from '~/components/Typography';
import { UserFollowCardFragment$key } from '~/generated/UserFollowCardFragment.graphql';
import { UserFollowCardQueryFragment$key } from '~/generated/UserFollowCardQueryFragment.graphql';

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
      }
    `,
    queryRef
  );

  const user = useFragment(
    graphql`
      fragment UserFollowCardFragment on GalleryUser {
        username
        bio

        ...FollowButtonUserFragment
      }
    `,
    userRef
  );

  const bioFirstLine = user.bio?.split('\n')[0];

  const handlePress = useCallback(() => {
    if (user.username) {
      onPress(user.username);
    }
  }, [onPress, user.username]);

  return (
    <View className="flex w-full flex-row items-center justify-between space-x-8 overflow-hidden py-3 px-4 h-16">
      <GalleryTouchableOpacity
        onPress={handlePress}
        className="flex flex-1 flex-grow flex-col h-full"
      >
        <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
          {user.username}
        </Typography>
        <Markdown numberOfLines={1}>{bioFirstLine}</Markdown>
      </GalleryTouchableOpacity>

      <FollowButton queryRef={query} userRef={user} />
    </View>
  );
}
