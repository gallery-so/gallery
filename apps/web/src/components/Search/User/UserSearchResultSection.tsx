import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

import { UserSearchResultSectionFragment$key } from '~/generated/UserSearchResultSectionFragment.graphql';

import { SearchFilterType } from '../Search';
import SearchSection from '../SearchSection';
import UserSearchResult from './UserSearchResult';

type Props = {
  title: string;
  isShowAll?: boolean;
  queryRef: UserSearchResultSectionFragment$key;
  onChangeFilter: (filter: SearchFilterType) => void;
};

export default function UserSearchResultSection({
  isShowAll = false,
  onChangeFilter,
  title,
  queryRef,
}: Props) {
  const results = useFragment(
    graphql`
      fragment UserSearchResultSectionFragment on UserSearchResult @relay(plural: true) {
        user @required(action: THROW) {
          id
          ...UserSearchResultFragment
        }
      }
    `,
    queryRef
  );

  const resultsToShow = useMemo(
    () => (isShowAll ? results : results?.slice(0, 4) ?? []),
    [results, isShowAll]
  );

  if (resultsToShow.length === 0) return null;

  return (
    <SearchSection title={title} isShowAll={isShowAll} onShowAll={() => onChangeFilter('curator')}>
      {resultsToShow.map((result) => (
        <UserSearchResult key={result.user.id} userRef={result.user} />
      ))}
    </SearchSection>
  );
}
