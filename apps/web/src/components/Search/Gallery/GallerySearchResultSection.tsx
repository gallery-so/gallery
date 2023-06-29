import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

import { GallerySearchResultSectionFragment$key } from '~/generated/GallerySearchResultSectionFragment.graphql';
import { GallerySearchResultSectionQueryFragment$key } from '~/generated/GallerySearchResultSectionQueryFragment.graphql';

import { NUM_PREVIEW_SEARCH_RESULTS } from '../constants';
import { SearchFilterType } from '../Search';
import SearchSection from '../SearchSection';
import GallerySearchResult from './GallerySearchResult';

type Props = {
  title: string;
  isShowAll?: boolean;
  resultRefs: GallerySearchResultSectionFragment$key;
  queryRef: GallerySearchResultSectionQueryFragment$key;
  onChangeFilter: (filter: SearchFilterType) => void;
};

export default function GallerySearchResultSection({
  isShowAll = false,
  onChangeFilter,
  title,
  resultRefs,
  queryRef,
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

  const query = useFragment(
    graphql`
      fragment GallerySearchResultSectionQueryFragment on Query {
        ...GallerySearchResultQueryFragment
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
      onShowAll={() => onChangeFilter('gallery')}
      numResults={results.length}
    >
      {resultsToShow.map((result) => (
        <GallerySearchResult key={result.gallery.id} galleryRef={result.gallery} queryRef={query} />
      ))}
    </SearchSection>
  );
}
