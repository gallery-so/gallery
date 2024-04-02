import { SearchDefaultTrendingCuratorsSectionFragment$key } from '~/generated/SearchDefaultTrendingCuratorsSectionFragment.graphql';
import { graphql, useFragment } from 'react-relay';
import { useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { contexts } from '~/shared/analytics/constants';

import { HStack } from '../core/Spacer/Stack';
import GalleryLink from '../core/GalleryLink/GalleryLink';
import SearchResultsHeader from './SearchResultsHeader';
import UserSearchResult from './User/UserSearchResult';
import { SearchItemType } from './types';
import { SearchFilterType } from './Search';

type Props = {
  queryRef: SearchDefaultTrendingCuratorsSectionFragment$key;
  variant: 'default' | 'compact';
  onSelect: (item: SearchItemType) => void;
  selectedFilter: SearchFilterType;
  onChangeFilter: (newFilter: SearchFilterType) => void;
  showAllButton?: boolean;
};

export default function SearchDefaultTrendingCuratorsSection({
  queryRef,
  variant,
  onSelect,
  selectedFilter,
  onChangeFilter,
  showAllButton = false,
}: Props) {
  const query = useFragment(
    graphql`
      fragment SearchDefaultTrendingCuratorsSectionFragment on Query {
        trendingUsers5Days: trendingUsers(input: { report: LAST_5_DAYS }) {
          ... on TrendingUsersPayload {
            __typename
            users {
              id
              ...UserSearchResultFragment
            }
          }
        }
      }
    `,
    queryRef
  );

  if (
    query.trendingUsers5Days?.__typename !== 'TrendingUsersPayload' ||
    !query.trendingUsers5Days.users
  ) {
    return null;
  }

  const trendingUsers = useMemo(() => {
    const { users } = query.trendingUsers5Days;

    if (selectedFilter !== 'curator') {
      return users?.slice(0, 4);
    }
    return users;
  }, [query, selectedFilter]);

  const isSelectedFilterCurator = useMemo(() => selectedFilter === 'curator');

  const handleToggleShowAll = useCallback(() => {
    if (isSelectedFilterCurator) {
      onChangeFilter(null);
    } else {
      onChangeFilter('curator');
    }
  }, [isSelectedFilterCurator, onChangeFilter]);

  return (
    <>
      <StyledResultHeader align="center" justify="space-between">
        <SearchResultsHeader variant={variant}>Trending Curators</SearchResultsHeader>
        {showAllButton && (
          <StyledGalleryLink
            onClick={handleToggleShowAll}
            eventElementId="Search Default Trending Curators Show All"
            eventName="Search Default Trending Curators Show All Click"
            eventContext={contexts.Search}
          >
            {!isSelectedFilterCurator ? 'Show all' : 'Hide All'}
          </StyledGalleryLink>
        )}
      </StyledResultHeader>
      {trendingUsers.map((user) => (
        <UserSearchResult
          key={user.id}
          userRef={user}
          variant={variant}
          onSelect={onSelect}
          keyword=""
        />
      ))}
    </>
  );
}

const StyledResultHeader = styled(HStack)`
  padding: 0 12px;
`;

const StyledGalleryLink = styled(GalleryLink)`
  font-size: 12px;
  line-height: 16px;
`;
