import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';

import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { UserSearchResultFragment$key } from '~/generated/UserSearchResultFragment.graphql';
import { UserSearchResultQueryFragment$key } from '~/generated/UserSearchResultQueryFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';

import isFeatureEnabled, { FeatureFlag } from '../../../utils/isFeatureEnabled';
import { SearchResult } from '../SearchResult';

type Props = {
  queryRef: UserSearchResultQueryFragment$key;
  userRef: UserSearchResultFragment$key;
};

export function UserSearchResult({ userRef, queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment UserSearchResultQueryFragment on Query {
        ...isFeatureEnabledFragment
      }
    `,
    queryRef
  );

  const user = useFragment(
    graphql`
      fragment UserSearchResultFragment on GalleryUser {
        username
        bio

        ...ProfilePictureFragment
      }
    `,
    userRef
  );

  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const handlePress = useCallback(() => {
    if (user.username) {
      navigation.push('Profile', { username: user.username });
    }
  }, [navigation, user.username]);

  const isPfpEnabled = isFeatureEnabled(FeatureFlag.PFP, query);

  return (
    <SearchResult
      profilePicture={isPfpEnabled ? <ProfilePicture userRef={user} size="sm" /> : null}
      onPress={handlePress}
      title={user?.username ?? ''}
      description={user?.bio ?? ''}
      variant="User"
    />
  );
}
