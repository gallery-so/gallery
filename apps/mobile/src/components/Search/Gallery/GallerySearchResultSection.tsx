import { useMemo } from 'react';
import { FlatList } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { GallerySearchResultSectionFragment$key } from '~/generated/GallerySearchResultSectionFragment.graphql';

import { NUM_PREVIEW_SEARCH_RESULTS } from '../constants';
import { SearchFilterType } from '../SearchFilter';
import { SearchSection } from '../SearchSection';
import { GallerySearchResult } from './GallerySearchResult';

type Props = {
  queryRef: GallerySearchResultSectionFragment$key;
  isShowingAll?: boolean;
  onChangeFilter: (filter: SearchFilterType) => void;
};

export function GallerySearchResultSection({ isShowingAll, queryRef, onChangeFilter }: Props) {
  const results = useFragment(
    graphql`
      fragment GallerySearchResultSectionFragment on GallerySearchResult @relay(plural: true) {
        gallery @required(action: THROW) {
          id
          ...GallerySearchResultFragment
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
      title="galleries"
      isShowAll={isShowingAll}
      numResults={results.length}
      onShowAll={() => onChangeFilter('gallery')}
    >
      <FlatList
        data={resultsToShow}
        renderItem={({ item }) => (
          <GallerySearchResult galleryRef={item.gallery} key={item.gallery.id} />
        )}
        scrollEnabled={Boolean(isShowingAll)}
        keyExtractor={(item) => item.gallery.id}
      />
    </SearchSection>
  );
}
