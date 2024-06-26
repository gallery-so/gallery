import { graphql, useLazyLoadQuery } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { SearchDefaultQuery } from '~/generated/SearchDefaultQuery.graphql';

import { VStack } from '../core/Spacer/Stack';
import { SearchFilterType } from './Search';
import SearchDefaultSuggestedUsersSection from './SearchDefaultSuggestedUsersSection';
import SearchDefaultTrendingCuratorsSection from './SearchDefaultTrendingCuratorsSection';
import SearchDefaultTrendingUsersSection from './SearchDefaultTrendingUsersSection';
import { SearchItemType } from './types';

type Props = {
  selectedFilter: SearchFilterType;
  onChangeFilter: (filter: SearchFilterType) => void;
  onSelect: (item: SearchItemType) => void;
  variant?: 'default' | 'compact';
};

export default function SearchDefault({
  variant = 'default',
  onSelect,
  selectedFilter,
  onChangeFilter,
}: Props) {
  const query = useLazyLoadQuery<SearchDefaultQuery>(
    graphql`
      query SearchDefaultQuery {
        ...SearchDefaultSuggestedUsersSectionFragment
        ...SearchDefaultTrendingUsersSectionFragment
        ...SearchDefaultTrendingCuratorsSectionFragment
      }
    `,
    {}
  );

  return (
    <SectionWrapper gap={20}>
      {!selectedFilter && (
        <VStack gap={16}>
          <SearchDefaultSuggestedUsersSection
            queryRef={query}
            variant={variant}
            onSelect={onSelect}
          />
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
  padding: 4px;

  @media only screen and ${breakpoints.desktop} {
    padding: 12px;
  }
`;
