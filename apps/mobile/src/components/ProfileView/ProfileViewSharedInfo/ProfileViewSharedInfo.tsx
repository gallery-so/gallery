import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { ProfileViewSharedInfoFragment$key } from '~/generated/ProfileViewSharedInfoFragment.graphql';

import ProfileViewSharedCommunities from './ProfileViewSharedCommunities';
import ProfileViewSharedFollowers from './ProfileViewSharedFollowers';

type Props = {
  userRef: ProfileViewSharedInfoFragment$key;
};

export default function ProfileViewSharedInfo({ userRef }: Props) {
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
    <View className="px-4 mb-3">
      <ProfileViewSharedCommunities userRef={user} />
      <ProfileViewSharedFollowers userRef={user} />
    </View>
  );
}
