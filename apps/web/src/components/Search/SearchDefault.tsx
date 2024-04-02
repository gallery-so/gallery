import { graphql, useLazyLoadQuery } from 'react-relay';

import { SearchDefaultQuery } from '~/generated/SearchDefaultQuery.graphql';
import { CmsTypes } from '~/scenes/ContentPages/cms_types';

import { VStack } from '../core/Spacer/Stack';
import SearchFeaturedCollectionSection from './SearchFeaturedCollectionSection';
import SearchSuggestedUsersSection from './SearchSuggestedUsersSection';
import { SearchItemType } from './types';
import SearchDefaultTrendingCuratorsSection from './SearchDefaultTrendingCurators';
import { SearchFilterType } from './Search';

type Props = {
  variant?: 'default' | 'compact';

  pageContent: CmsTypes.LandingPage;
  selectedFilter: SearchFilterType;
  onChangeFilter: (filter: SearchFilterType) => void;
  onSelect: (item: SearchItemType) => void;
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

  const { featuredProfiles } = pageContent ?? [];
  const featuredProfilesData = featuredProfiles?.slice(0, 2);

  return (
    <VStack>
      {selectedFilter !== 'curator' && (
        <>
          <SearchFeaturedCollectionSection profiles={featuredProfilesData} variant={variant} />
          <SearchSuggestedUsersSection queryRef={query} variant={variant} />
        </>
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
