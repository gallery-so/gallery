import { View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { FollowButton } from '~/components/FollowButton';
import { Markdown } from '~/components/Markdown';
import { Typography } from '~/components/Typography';
import { UserFollowCardFragment$key } from '~/generated/UserFollowCardFragment.graphql';
import { UserFollowCardQueryFragment$key } from '~/generated/UserFollowCardQueryFragment.graphql';

type UserFollowCardProps = {
  userRef: UserFollowCardFragment$key;
  queryRef: UserFollowCardQueryFragment$key;
};

export function UserFollowCard({ userRef, queryRef }: UserFollowCardProps) {
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

  return (
    <View className="flex w-full flex-row items-center justify-between space-x-8 overflow-hidden py-3 px-4">
      <View className="flex flex-1 flex-grow flex-col">
        <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
          {user.username}
        </Typography>
        <Markdown numberOfLines={1}>{bioFirstLine}</Markdown>
      </View>

      <FollowButton queryRef={query} userRef={user} />
    </View>
  );
}
