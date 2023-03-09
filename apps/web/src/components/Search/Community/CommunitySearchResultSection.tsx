import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

import { CommunitySearchResultSectionFragment$key } from '~/generated/CommunitySearchResultSectionFragment.graphql';

import { SearchFilterType } from '../Search';
import SearchSection from '../SearchSection';
import CommunitySearchResult from './CommunitySearchResult';

type Props = {
  title: string;
  isShowAll?: boolean;
  queryRef: CommunitySearchResultSectionFragment$key;
  onChangeFilter: (filter: SearchFilterType) => void;
};

export default function CommunitySearchResultSection({
  isShowAll = false,
  onChangeFilter,
  title,
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
    queryRef
  );

  const resultsToShow = useMemo(
    () => (isShowAll ? results : results?.slice(0, 4) ?? []),
    [results, isShowAll]
  );

  return (
    <SearchSection
      title={title}
      isShowAll={isShowAll}
      onShowAll={() => onChangeFilter('curator')}
      hasResult={results.length > 0}
    >
      {resultsToShow.map((result) => (
        <CommunitySearchResult key={result.community.dbid} communityRef={result.community} />
      ))}
    </SearchSection>
  );
}
