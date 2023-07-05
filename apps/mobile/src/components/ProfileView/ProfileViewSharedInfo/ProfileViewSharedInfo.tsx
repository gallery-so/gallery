import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { ProfileViewSharedInfoFragment$key } from '~/generated/ProfileViewSharedInfoFragment.graphql';
import { ProfileViewSharedInfoQueryFragment$key } from '~/generated/ProfileViewSharedInfoQueryFragment.graphql';

import ProfileViewSharedCommunities from './ProfileViewSharedCommunities';
import ProfileViewSharedFollowers from './ProfileViewSharedFollowers';

type Props = {
  queryRef: ProfileViewSharedInfoQueryFragment$key;
  userRef: ProfileViewSharedInfoFragment$key;
};

export default function ProfileViewSharedInfo({ userRef, queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment ProfileViewSharedInfoQueryFragment on Query {
        ...ProfileViewSharedFollowersQueryFragment
      }
    `,
    queryRef
  );

  const user = useFragment(
    graphql`
      fragment ProfileViewSharedInfoFragment on GalleryUser {
        __typename
        ...ProfileViewSharedFollowersFragment
        ...ProfileViewSharedCommunitiesFragment
      }
    `,
    userRef
  );

  return (
    <View className="px-4 mb-3 space-y-1">
      <View>
        <ProfileViewSharedCommunities userRef={user} />
      </View>
      <View>
        <ProfileViewSharedFollowers queryRef={query} userRef={user} />
      </View>
    </View>
  );
}
