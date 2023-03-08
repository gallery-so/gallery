import { graphql, useLazyLoadQuery } from 'react-relay';
import styled from 'styled-components';

import { SearchResultsQuery } from '~/generated/SearchResultsQuery.graphql';

import { VStack } from '../core/Spacer/Stack';
import { SearchFilterType } from './Search';
import UserSearchResultSection from './User/UserSearchResultSection';

type Props = {
  keyword: string;
  activeFilter: SearchFilterType;
  onChangeFilter: (filter: SearchFilterType) => void;
};

export default function SearchResults({ activeFilter, keyword, onChangeFilter }: Props) {
  const query = useLazyLoadQuery<SearchResultsQuery>(
    graphql`
      query SearchResultsQuery($query: String!) {
        searchUsers(query: $query) {
          __typename
          ... on SearchUsersPayload {
            __typename
            results {
              __typename
              ...UserSearchResultSectionFragment
            }
          }
        }
      }
    `,
    { query: keyword }
  );

  return (
    <StyledSearchResultContainer>
      {query?.searchUsers?.__typename === 'SearchUsersPayload' && query?.searchUsers?.results && (
        <UserSearchResultSection
          title="curators"
          queryRef={query?.searchUsers?.results}
          onChangeFilter={onChangeFilter}
          isShowAll={activeFilter === 'curator'}
        />
      )}
    </StyledSearchResultContainer>
  );
}

const StyledSearchResultContainer = styled(VStack)``;
