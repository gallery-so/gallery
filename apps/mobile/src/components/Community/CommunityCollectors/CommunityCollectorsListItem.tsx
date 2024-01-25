import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';

import { UserFollowCard } from '~/components/UserFollowList/UserFollowCard';
import { CommunityCollectorsListItemFragment$key } from '~/generated/CommunityCollectorsListItemFragment.graphql';
import { CommunityCollectorsListItemQueryFragment$key } from '~/generated/CommunityCollectorsListItemQueryFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';

type Props = {
  userRef: CommunityCollectorsListItemFragment$key;
  queryRef: CommunityCollectorsListItemQueryFragment$key;
};

export function CommunityCollectorsListItem({ userRef, queryRef }: Props) {
  const user = useFragment(
    graphql`
      fragment CommunityCollectorsListItemFragment on GalleryUser {
        username
        ...UserFollowCardFragment
      }
    `,
    userRef
  );

  const query = useFragment(
    graphql`
      fragment CommunityCollectorsListItemQueryFragment on Query {
        ...UserFollowCardQueryFragment
      }
    `,
    queryRef
  );

  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const handlePress = useCallback(() => {
    if (user.username) {
      navigation.push('Profile', {
        username: user.username,
        hideBackButton: false,
      });
    }
  }, [navigation, user.username]);

  return <UserFollowCard userRef={user} queryRef={query} onPress={handlePress} />;
}
