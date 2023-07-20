import { Route } from 'nextjs-routes';
import { graphql, useFragment } from 'react-relay';

import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { UserSearchResultFragment$key } from '~/generated/UserSearchResultFragment.graphql';

import SearchResult from '../SearchResult';

type Props = {
  userRef: UserSearchResultFragment$key;
};

export default function UserSearchResult({ userRef }: Props) {
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

  const route = {
    pathname: '/[username]',
    query: { username: user.username as string },
  } as Route;

  return (
    <SearchResult
      name={user.username ?? ''}
      description={user.bio ?? ''}
      path={route}
      type="curator"
      profilePicture={<ProfilePicture userRef={user} size="md" />}
    />
  );
}
