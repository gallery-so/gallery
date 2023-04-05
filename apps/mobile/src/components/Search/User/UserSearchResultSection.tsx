import { useMemo } from 'react';
import { FlatList } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { UserSearchResultSectionFragment$key } from '~/generated/UserSearchResultSectionFragment.graphql';

import { NUM_PREVIEW_SEARCH_RESULTS } from '../constants';
import { SearchFilterType } from '../SearchFilter';
import { SearchSection } from '../SearchSection';
import { UserSearchResult } from './UserSearchResult';

type Props = {
  queryRef: UserSearchResultSectionFragment$key;
  isShowingAll?: boolean;
  onChangeFilter: (filter: SearchFilterType) => void;
};

export function UserSearchResultSection({ isShowingAll, queryRef, onChangeFilter }: Props) {
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
    () => (isShowingAll ? results : results?.slice(0, NUM_PREVIEW_SEARCH_RESULTS) ?? []),
    [results, isShowingAll]
  );

  return (
    <SearchSection
      title="curators"
      isShowAll={isShowingAll}
      numResults={results.length}
      onShowAll={() => onChangeFilter('curator')}
    >
      <FlatList
        data={resultsToShow}
        renderItem={({ item }) => <UserSearchResult userRef={item.user} />}
        scrollEnabled={Boolean(isShowingAll)}
        keyExtractor={(item) => item.user.id}
      />
    </SearchSection>
  );
}
