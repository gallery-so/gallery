import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import { ProfilePicture } from '../ProfilePicture/ProfilePicture';
import { Typography } from '../Typography';
import { ButtonChip } from '~/components/ButtonChip';
import ProcessedText from '../ProcessedText/ProcessedText';
import { FollowButton } from '../FollowButton';

type SuggestedUserFollowCardProps = {
  userRef: SuggestedUserFollowCardFragment$key;
  queryRef: SuggestedUserFollowCardQueryFragment$key;
};

export function SuggestedUserFollowCard({ userRef, queryRef }: SuggestedUserFollowCardProps) {
  const query = useFragment(
    graphql`
      fragment SuggestedUserFollowCardQueryFragment on Query {
        ...FollowButtonQueryFragment
      }
    `,
    queryRef
  );

  const user = useFragment(
    graphql`
      fragment SuggestedUserFollowCardFragment on GalleryUser {
        username
        bio

        ...ProfilePictureFragment
        ...FollowButtonUserFragment
      }
    `,
    userRef
  );

  const bioFirstLine = user.bio?.split('\n')[0];

  return (
    <View className="flex w-full flex-row items-center space-x-8 overflow-hidden">
      <View className="flex flex-1 flex-grow flex-col py-3">
        <View className="flex flex-row items-center">
          <ProfilePicture userRef={user} size="md" />
          <View className="px-3 w-full">
            <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
              {user.username}
            </Typography>
            {bioFirstLine && <ProcessedText numberOfLines={1} text={bioFirstLine} />}
          </View>
        </View>
      </View>

      <View className="flex mr-2">
        <FollowButton
          queryRef={query}
          userRef={user}
          flipVariant={true}
          styleChip={{
            width: 80,
          }}
        />
      </View>
    </View>
  );
}
