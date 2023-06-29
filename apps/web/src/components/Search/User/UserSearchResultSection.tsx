import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

import { UserSearchResultSectionFragment$key } from '~/generated/UserSearchResultSectionFragment.graphql';
import { UserSearchResultSectionQueryFragment$key } from '~/generated/UserSearchResultSectionQueryFragment.graphql';

import { NUM_PREVIEW_SEARCH_RESULTS } from '../constants';
import { SearchFilterType } from '../Search';
import SearchSection from '../SearchSection';
import UserSearchResult from './UserSearchResult';

type Props = {
  title: string;
  isShowAll?: boolean;
  resultRefs: UserSearchResultSectionFragment$key;
  queryRef: UserSearchResultSectionQueryFragment$key;
  onChangeFilter: (filter: SearchFilterType) => void;
};

export default function UserSearchResultSection({
  isShowAll = false,
  onChangeFilter,
  title,
  resultRefs,
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
    resultRefs
  );

  const query = useFragment(
    graphql`
      fragment UserSearchResultSectionQueryFragment on Query {
        ...UserSearchResultQueryFragment
      }
    `,
    queryRef
  );

  const resultsToShow = useMemo(
    () => (isShowAll ? results : results?.slice(0, NUM_PREVIEW_SEARCH_RESULTS) ?? []),
    [results, isShowAll]
  );

  return (
    <SearchSection
      title={title}
      isShowAll={isShowAll}
      onShowAll={() => onChangeFilter('curator')}
      numResults={results.length}
    >
      {resultsToShow.map((result) => (
        <UserSearchResult key={result.user.id} userRef={result.user} queryRef={query} />
      ))}
    </SearchSection>
  );
}
