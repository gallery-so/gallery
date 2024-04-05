import { graphql, useLazyLoadQuery } from 'react-relay';
import styled from 'styled-components';

import { SearchDefaultQuery } from '~/generated/SearchDefaultQuery.graphql';
import { CmsTypes } from '~/scenes/ContentPages/cms_types';

import { VStack } from '../core/Spacer/Stack';
import { SearchFilterType } from './Search';
import SearchDefaultTrendingCuratorsSection from './SearchDefaultTrendingCuratorsSection';
import SearchDefaultTrendingUsersSection from './SearchDefaultTrendingUsersSection';
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
        ...SearchDefaultTrendingUsersSectionFragment
        ...SearchDefaultTrendingCuratorsSectionFragment
      }
    `,
    {}
  );

  return (
    <SectionWrapper gap={18}>
      {!selectedFilter && (
        <VStack gap={16}>
          <SearchSuggestedUsersSection queryRef={query} variant={variant} onSelect={onSelect} />
          <SearchDefaultTrendingUsersSection
            queryRef={query}
            variant={variant}
            onSelect={onSelect}
          />
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
    </SectionWrapper>
  );
}

const SectionWrapper = styled(VStack)`
  padding: 12px;
`;
