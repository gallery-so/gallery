import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

import { CommunitySearchResultSectionFragment$key } from '~/generated/CommunitySearchResultSectionFragment.graphql';
import { CommunitySearchResultSectionQueryFragment$key } from '~/generated/CommunitySearchResultSectionQueryFragment.graphql';

import { NUM_PREVIEW_SEARCH_RESULTS } from '../constants';
import { SearchFilterType } from '../Search';
import SearchSection from '../SearchSection';
import CommunitySearchResult from './CommunitySearchResult';

type Props = {
  title: string;
  isShowAll?: boolean;
  resultRefs: CommunitySearchResultSectionFragment$key;
  queryRef: CommunitySearchResultSectionQueryFragment$key;
  onChangeFilter: (filter: SearchFilterType) => void;
};

export default function CommunitySearchResultSection({
  isShowAll = false,
  onChangeFilter,
  title,
  resultRefs,
  queryRef,
}: Props) {
  const results = useFragment(
    graphql`
      fragment CommunitySearchResultSectionFragment on CommunitySearchResult @relay(plural: true) {
        community @required(action: THROW) {
          dbid
          ...CommunitySearchResultFragment
        }
      }
    `,
    resultRefs
  );

  const query = useFragment(
    graphql`
      fragment CommunitySearchResultSectionQueryFragment on Query {
        ...CommunitySearchResultQueryFragment
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
      onShowAll={() => onChangeFilter('community')}
      numResults={results.length}
    >
      {resultsToShow.map((result) => (
        <CommunitySearchResult
          key={result.community.dbid}
          communityRef={result.community}
          queryRef={query}
        />
      ))}
    </SearchSection>
  );
}
