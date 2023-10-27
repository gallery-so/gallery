import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import { MentionType } from 'src/hooks/useMentionableMessage';

import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { UserSearchResultFragment$key } from '~/generated/UserSearchResultFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';

import { SearchResult } from '../SearchResult';

type Props = {
  userRef: UserSearchResultFragment$key;
  onSelect?: (item: MentionType) => void;
  keyword: string;
};

export function UserSearchResult({ userRef, keyword, onSelect }: Props) {
  const user = useFragment(
    graphql`
      fragment UserSearchResultFragment on GalleryUser {
        dbid
        username
        bio

        ...ProfilePictureFragment
      }
    `,
    userRef
  );

  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const handlePress = useCallback(() => {
    if (onSelect) {
      onSelect({
        type: 'User',
        label: user.username ?? '',
        value: user.dbid,
      });
      return;
    }

    if (user.username) {
      navigation.push('Profile', { username: user.username, tab: 'Galleries' });
    }
  }, [onSelect, navigation, user.dbid, user.username]);

  return (
    <SearchResult
      profilePicture={<ProfilePicture userRef={user} size="md" />}
      onPress={handlePress}
      title={user?.username ?? ''}
      description={user?.bio ?? ''}
      variant="User"
      keyword={keyword}
    />
  );
}
