import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';

import { UserSearchResultFragment$key } from '~/generated/UserSearchResultFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';

import { SearchResult } from '../SearchResult';

type Props = {
  userRef: UserSearchResultFragment$key;
};

export function UserSearchResult({ userRef }: Props) {
  const user = useFragment(
    graphql`
      fragment UserSearchResultFragment on GalleryUser {
        username
        bio
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

  return (
    <SearchResult
      onPress={handlePress}
      title={user?.username ?? ''}
      description={user?.bio ?? ''}
    />
  );
}
