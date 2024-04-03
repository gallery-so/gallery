import { useMemo } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { SearchDefaultQuery } from '~/generated/SearchDefaultQuery.graphql';
import { CmsTypes } from '~/scenes/ContentPages/cms_types';

import { VStack } from '../core/Spacer/Stack';
import { SearchFilterType } from './Search';
import SearchDefaultTrendingCuratorsSection from './SearchDefaultTrendingCuratorsSection';
import SearchFeaturedCollectionSection from './SearchFeaturedCollectionSection';
import SearchSuggestedUsersSection from './SearchSuggestedUsersSection';
import { SearchItemType } from './types';

type Props = {
  selectedFilter: SearchFilterType;
  onChangeFilter: (filter: SearchFilterType) => void;
  onSelect: (item: SearchItemType) => void;
  pageContent?: CmsTypes.LandingPage;
  variant?: 'default' | 'compact';
};

export default function SearchDefault({
  variant = 'default',
  onSelect,
  selectedFilter,
  onChangeFilter,
  pageContent,
}: Props) {
  const query = useLazyLoadQuery<SearchDefaultQuery>(
    graphql`
      query SearchDefaultQuery {
        ...SearchSuggestedUsersSectionFragment
        ...SearchDefaultTrendingCuratorsSectionFragment
      }
    `,
    {}
  );

  const featuredProfiles = useMemo(() => {
    if (pageContent) {
      return pageContent.featuredProfiles?.slice(0, 2);
    }
    return [];
  }, [pageContent]);

  return (
    <VStack gap={18}>
      {!selectedFilter && (
        <VStack gap={12}>
          <SearchFeaturedCollectionSection
            profiles={featuredProfiles}
            variant={variant}
            onSelect={onSelect}
          />
          <SearchSuggestedUsersSection queryRef={query} variant={variant} onSelect={onSelect} />
        </VStack>
      )}
      <SearchDefaultTrendingCuratorsSection
        queryRef={query}
        variant={variant}
        onSelect={onSelect}
        selectedFilter={selectedFilter}
        onChangeFilter={onChangeFilter}
        showAllButton={true}
      />
    </VStack>
  );
}
