import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

import { GallerySearchResultSectionFragment$key } from '~/generated/GallerySearchResultSectionFragment.graphql';

import { NUM_PREVIEW_SEARCH_RESULTS } from '../constants';
import { SearchFilterType } from '../Search';
import { SearchResultVariant } from '../SearchResults';
import SearchSection from '../SearchSection';
import GallerySearchResult from './GallerySearchResult';

type Props = {
  title: string;
  isShowAll?: boolean;
  resultRefs: GallerySearchResultSectionFragment$key;

  onChangeFilter: (filter: SearchFilterType) => void;
  variant: SearchResultVariant;
};

export default function GallerySearchResultSection({
  isShowAll = false,
  onChangeFilter,
  title,
  resultRefs,
  variant,
}: Props) {
  const results = useFragment(
    graphql`
      fragment GallerySearchResultSectionFragment on GallerySearchResult @relay(plural: true) {
        gallery @required(action: THROW) {
          id
          ...GallerySearchResultFragment
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
      onShowAll={() => onChangeFilter('gallery')}
      numResults={results.length}
      variant={variant}
    >
      {resultsToShow.map((result) => (
        <GallerySearchResult key={result.gallery.id} galleryRef={result.gallery} />
      ))}
    </SearchSection>
  );
}
