import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

import { CommunitySearchResultSectionFragment$key } from '~/generated/CommunitySearchResultSectionFragment.graphql';
import { MentionType } from '~/shared/hooks/useMentionableMessage';

import { NUM_PREVIEW_SEARCH_RESULTS } from '../constants';
import { SearchFilterType } from '../Search';
import { SearchResultVariant } from '../SearchResults';
import SearchSection from '../SearchSection';
import CommunitySearchResult from './CommunitySearchResult';

type Props = {
  title: string;
  isShowAll?: boolean;
  resultRefs: CommunitySearchResultSectionFragment$key;
  variant: SearchResultVariant;

  onChangeFilter: (filter: SearchFilterType) => void;
  onSelect?: (item: MentionType) => void;
};

export default function CommunitySearchResultSection({
  isShowAll = false,
  onChangeFilter,
  title,
  resultRefs,
  onSelect,
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
      onShowAll={() => onChangeFilter('community')}
      numResults={results.length}
      variant={variant}
    >
      {resultsToShow.map((result) => (
        <CommunitySearchResult
          key={result.community.dbid}
          communityRef={result.community}
          variant={variant}
          onSelect={onSelect}
        />
      ))}
    </SearchSection>
  );
}
