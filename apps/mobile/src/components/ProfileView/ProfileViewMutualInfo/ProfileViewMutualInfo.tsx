import { Text, View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { ProfileViewMutualInfoFragment$key } from '~/generated/ProfileViewMutualInfoFragment.graphql';

import ProfileViewMutualFollowers from './ProfileViewMutualFollowers';

type Props = {
  userRef: ProfileViewMutualInfoFragment$key;
  queryRef;
};

export default function ProfileViewMutualInfo({ userRef, queryRef }: Props) {
  const user = useFragment(
    graphql`
      fragment ProfileViewMutualInfoFragment on GalleryUser {
        __typename
        ...ProfileViewMutualFollowersFragment
        # ...UserSharedCommunitiesFragment
      }
    `,
    userRef
  );

  // console.log(query);

  return (
    <View className="px-4 mb-3">
      <ProfileViewMutualFollowers userRef={user} queryRef={queryRef} />
    </View>
  );
}
