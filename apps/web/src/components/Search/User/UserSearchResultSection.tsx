import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

import { UserSearchResultSectionFragment$key } from '~/generated/UserSearchResultSectionFragment.graphql';
import { MentionType } from '~/shared/hooks/useMentionableMessage';

import { NUM_PREVIEW_SEARCH_RESULTS } from '../constants';
import { SearchFilterType } from '../Search';
import SearchSection from '../SearchSection';
import UserSearchResult from './UserSearchResult';

type Props = {
  title: string;
  isShowAll?: boolean;
  resultRefs: UserSearchResultSectionFragment$key;
  variant?: 'default' | 'compact';
  keyword: string;

  onChangeFilter: (filter: SearchFilterType) => void;
  onSelect?: (item: MentionType) => void;
  onClose?: () => void;
};

export default function UserSearchResultSection({
  isShowAll = false,
  onChangeFilter,
  keyword,
  title,
  resultRefs,
  onSelect,
  onClose,
  variant = 'default',
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
      variant={variant}
    >
      {resultsToShow.map((result) => (
        <UserSearchResult
          key={result.user.id}
          userRef={result.user}
          variant={variant}
          onSelect={onSelect}
          keyword={keyword}
          onClose={onClose}
        />
      ))}
    </SearchSection>
  );
}
