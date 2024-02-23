import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

import { CommunitySearchResultSectionFragment$key } from '~/generated/CommunitySearchResultSectionFragment.graphql';

import { NUM_PREVIEW_SEARCH_RESULTS } from '../constants';
import { SearchFilterType } from '../Search';
import SearchSection from '../SearchSection';
import { SearchItemType, SearchResultVariant } from '../types';
import CommunitySearchResult from './CommunitySearchResult';

type Props = {
  title: string;
  isShowAll?: boolean;
  resultRefs: CommunitySearchResultSectionFragment$key;
  variant: SearchResultVariant;
  keyword: string;

  onChangeFilter: (filter: SearchFilterType) => void;
  onSelect: (item: SearchItemType) => void;
};

export default function CommunitySearchResultSection({
  isShowAll = false,
  onChangeFilter,
  title,
  resultRefs,
  onSelect,
  keyword,
  variant,
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

  const resultsToShow = useMemo(
    () => (isShowAll ? results : results?.slice(0, NUM_PREVIEW_SEARCH_RESULTS) ?? []),
    [results, isShowAll]
  );

  return (
    <SearchSection
      title={title}
      isShowAll={isShowAll}
      onShowAll={() => onChangeFilter('collection')}
      numResults={results.length}
      variant={variant}
    >
      {resultsToShow.map((result) => (
        <CommunitySearchResult
          key={result.community.dbid}
          communityRef={result.community}
          variant={variant}
          onSelect={onSelect}
          keyword={keyword}
        />
      ))}
    </SearchSection>
  );
}
