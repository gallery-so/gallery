import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

import { CommunitySearchResultSectionFragment$key } from '~/generated/CommunitySearchResultSectionFragment.graphql';

import { NUM_PREVIEW_SEARCH_RESULTS } from '../constants';
import { SearchFilterType } from '../Search';
import SearchSection from '../SearchSection';
import CommunitySearchResult from './CommunitySearchResult';

type Props = {
  title: string;
  isShowAll?: boolean;
  resultRefs: CommunitySearchResultSectionFragment$key;
  onChangeFilter: (filter: SearchFilterType) => void;
};

export default function CommunitySearchResultSection({
  isShowAll = false,
  onChangeFilter,
  title,
  resultRefs,
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
      onShowAll={() => onChangeFilter('community')}
      numResults={results.length}
    >
      {resultsToShow.map((result) => (
        <CommunitySearchResult key={result.community.dbid} communityRef={result.community} />
      ))}
    </SearchSection>
  );
}
