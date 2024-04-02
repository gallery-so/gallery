import { SearchDefaultTrendingCuratorsSectionFragment$key } from '~/generated/SearchDefaultTrendingCuratorsSectionFragment.graphql';
import { graphql, useFragment } from 'react-relay';

import SearchResultsHeader from './SearchResultsHeader';
import UserSearchResult from './User/UserSearchResult';
import { SearchItemType } from './types';

type Props = {
  queryRef: SearchDefaultTrendingCuratorsSectionFragment$key;
  variant: 'default' | 'compact';
  onSelect: (item: SearchItemType) => void;
};

export default function SearchDefaultTrendingCuratorsSection({
  queryRef,
  variant,
  onSelect,
}: Props) {
  const query = useFragment(
    graphql`
      fragment SearchDefaultTrendingCuratorsSectionFragment on Query {
        trendingUsers5Days: trendingUsers(input: { report: LAST_5_DAYS }) {
          ... on TrendingUsersPayload {
            __typename
            users {
              id
              ...UserSearchResultFragment
            }
          }
        }
      }
    `,
    queryRef
  );

  if (
    query.trendingUsers5Days?.__typename !== 'TrendingUsersPayload' ||
    !query.trendingUsers5Days.users
  ) {
    return null;
  }

  const { users: trendingUsers } = query.trendingUsers5Days;

  return (
    <>
      <SearchResultsHeader variant={variant}>Trending Curators</SearchResultsHeader>
      {trendingUsers.map((user) => (
        <UserSearchResult
          key={user.id}
          userRef={user}
          variant={variant}
          onSelect={onSelect}
          keyword=""
        />
      ))}
    </>
  );
}
