import { useRouter } from 'next/router';
import { Route } from 'nextjs-routes';
import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { UserSearchResultFragment$key } from '~/generated/UserSearchResultFragment.graphql';
import { MentionType } from '~/shared/hooks/useMentionableMessage';

import SearchResult from '../SearchResult';
import { SearchResultVariant } from '../SearchResults';

type Props = {
  keyword: string;
  userRef: UserSearchResultFragment$key;
  variant: SearchResultVariant;

  onSelect?: (item: MentionType) => void;
  onClose?: () => void;
};

export default function UserSearchResult({ keyword, userRef, variant, onSelect, onClose }: Props) {
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

  const router = useRouter();

  const route = useMemo(() => {
    return {
      pathname: '/[username]',
      query: { username: user.username as string },
    } as Route;
  }, [user.username]);

  const handleClick = useCallback(() => {
    if (onSelect) {
      onSelect({
        type: 'User',
        label: user.username ?? '',
        value: user.dbid,
      });
      return;
    }

    router.push(route);
    onClose?.();
  }, [onClose, onSelect, route, router, user.dbid, user.username]);

  return (
    <SearchResult
      name={user.username ?? ''}
      description={user.bio ?? ''}
      path={route}
      type="curator"
      profilePicture={<ProfilePicture userRef={user} size="md" />}
      variant={variant}
      onClick={handleClick}
      keyword={keyword}
    />
  );
}
