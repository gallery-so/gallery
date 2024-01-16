import { useCallback } from 'react';
import { View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { FollowButton } from '~/components/FollowButton';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { Typography } from '~/components/Typography';
import { UserFollowCardFragment$key } from '~/generated/UserFollowCardFragment.graphql';
import { UserFollowCardQueryFragment$key } from '~/generated/UserFollowCardQueryFragment.graphql';
import colors from '~/shared/theme/colors';

import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';
import ProcessedText from '../ProcessedText/ProcessedText';

type UserFollowCardProps = {
  userRef: UserFollowCardFragment$key;
  queryRef: UserFollowCardQueryFragment$key;
  onPress: (username: string) => void;
  onFollowPress?: () => void;
  isPresentational?: boolean;
};

export function UserFollowCard({
  userRef,
  queryRef,
  onPress,
  onFollowPress,
  isPresentational = false,
}: UserFollowCardProps) {
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

        ...ProfilePictureFragment
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
    <View
      className={`flex w-full flex-row items-center space-x-8 overflow-hidden${
        !isPresentational ? ' px-4' : ''
      }`}
    >
      <GalleryTouchableOpacity
        onPress={handlePress}
        disabled={isPresentational}
        className="flex flex-1 flex-grow flex-col py-2"
        eventElementId="User Follow Username"
        eventName="User Follow Username Clicked"
        // TODO: analytics prop drill
        eventContext={null}
      >
        <View className="flex flex-row items-center">
          <ProfilePicture userRef={user} size="md" />
          <View className="px-3 w-full">
            <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
              {user.username}
            </Typography>
            {bioFirstLine && <ProcessedText numberOfLines={1} text={bioFirstLine} />}
          </View>
        </View>
      </GalleryTouchableOpacity>
      {!isPresentational ? (
        <FollowButton queryRef={query} userRef={user} />
      ) : (
        <FollowButton
          queryRef={query}
          userRef={user}
          variant="white"
          styleChip={{
            width: 80,
            borderWidth: 1,
            borderColor: colors.faint,
          }}
          onPress={onFollowPress}
        />
      )}
    </View>
  );
}
