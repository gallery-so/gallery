import { graphql, useFragment } from 'react-relay';

import { UserSearchResultFragment$key } from '~/generated/UserSearchResultFragment.graphql';

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

  return <SearchResult title={user?.username ?? ''} description={user?.bio ?? ''} />;
}
