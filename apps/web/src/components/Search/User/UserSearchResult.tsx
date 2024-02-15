import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { UserSearchResultFragment$key } from '~/generated/UserSearchResultFragment.graphql';

import SearchResult from '../SearchResult';
import { SearchItemType, SearchResultVariant } from '../types';

type Props = {
  keyword: string;
  userRef: UserSearchResultFragment$key;
  variant: SearchResultVariant;

  onSelect: (item: SearchItemType) => void;
};

export default function UserSearchResult({ keyword, userRef, variant, onSelect }: Props) {
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
  const route = useMemo(() => {
    return {
      type: 'User' as const,
      label: user.username ?? '',
      value: user.dbid,
    };
  }, [user.username, user.dbid]);

  const handleClick = useCallback(() => {
    onSelect(route);
  }, [onSelect, route]);

  return (
    <SearchResult
      name={user.username ?? ''}
      description={user.bio ?? ''}
      profilePicture={<ProfilePicture userRef={user} size="md" />}
      variant={variant}
      onClick={handleClick}
      keyword={keyword}
      route={JSON.stringify(route)}
    />
  );
}
