import { Route } from 'nextjs-routes';
import { graphql, useFragment } from 'react-relay';

import { UserSearchResultFragment$key } from '~/generated/UserSearchResultFragment.graphql';
import { UserSearchResultQueryFragment$key } from '~/generated/UserSearchResultQueryFragment.graphql';

import SearchResult from '../SearchResult';

type Props = {
  userRef: UserSearchResultFragment$key;
  queryRef: UserSearchResultQueryFragment$key;
};

export default function UserSearchResult({ userRef, queryRef }: Props) {
  const user = useFragment(
    graphql`
      fragment UserSearchResultFragment on GalleryUser {
        username
        bio
        ...SearchResultUserFragment
      }
    `,
    userRef
  );

  const query = useFragment(
    graphql`
      fragment UserSearchResultQueryFragment on Query {
        ...SearchResultQueryFragment
      }
    `,
    queryRef
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
      userRef={user}
      queryRef={query}
    />
  );
}
