import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

import { GallerySearchResultSectionFragment$key } from '~/generated/GallerySearchResultSectionFragment.graphql';

import { SearchFilterType } from '../Search';
import SearchSection from '../SearchSection';
import GallerySearchResult from './GallerySearchResult';

type Props = {
  title: string;
  isShowAll?: boolean;
  queryRef: GallerySearchResultSectionFragment$key;
  onChangeFilter: (filter: SearchFilterType) => void;
};

export default function GallerySearchResultSection({
  isShowAll = false,
  onChangeFilter,
  title,
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
      onShowAll={() => onChangeFilter('gallery')}
      hasResult={results.length > 0}
    >
      {resultsToShow.map((result) => (
        <GallerySearchResult key={result.gallery.id} galleryRef={result.gallery} />
      ))}
    </SearchSection>
  );
}
