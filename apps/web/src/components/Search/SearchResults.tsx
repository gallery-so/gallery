import { graphql, useLazyLoadQuery } from 'react-relay';
import styled from 'styled-components';

import { SearchResultsQuery } from '~/generated/SearchResultsQuery.graphql';

import { VStack } from '../core/Spacer/Stack';
import CommunitySearchResultSection from './Community/CommunitySearchResultSection';
import GallerySearchResultSection from './Gallery/GallerySearchResultSection';
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
        searchGalleries(query: $query) {
          __typename
          ... on SearchGalleriesPayload {
            __typename
            results {
              __typename
              ...GallerySearchResultSectionFragment
            }
          }
        }
        searchCommunities(query: $query) {
          __typename
          ... on SearchCommunitiesPayload {
            __typename
            results {
              __typename
              ...CommunitySearchResultSectionFragment
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
      {query?.searchGalleries?.__typename === 'SearchGalleriesPayload' &&
        query?.searchGalleries?.results && (
          <GallerySearchResultSection
            title="galleries"
            queryRef={query?.searchGalleries?.results}
            onChangeFilter={onChangeFilter}
            isShowAll={activeFilter === 'gallery'}
          />
        )}
      {query?.searchCommunities?.__typename === 'SearchCommunitiesPayload' &&
        query?.searchCommunities?.results && (
          <CommunitySearchResultSection
            title="communities"
            queryRef={query?.searchCommunities?.results}
            onChangeFilter={onChangeFilter}
            isShowAll={activeFilter === 'community'}
          />
        )}
    </StyledSearchResultContainer>
  );
}

const StyledSearchResultContainer = styled(VStack)``;
