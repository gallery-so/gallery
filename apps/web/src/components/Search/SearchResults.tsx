import { useDeferredValue, useMemo } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import styled, { css } from 'styled-components';

import { SearchResultsQuery } from '~/generated/SearchResultsQuery.graphql';

import { VStack } from '../core/Spacer/Stack';
import { TitleDiatypeL } from '../core/Text/Text';
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
  const deferredKeyword = useDeferredValue(keyword);

  const query = useLazyLoadQuery<SearchResultsQuery>(
    graphql`
      query SearchResultsQuery($query: String!) {
        searchUsers(query: $query) {
          __typename
          ... on SearchUsersPayload {
            __typename
            results @required(action: THROW) {
              __typename
              ...UserSearchResultSectionFragment
            }
          }
        }
        searchGalleries(query: $query) {
          __typename
          ... on SearchGalleriesPayload {
            __typename
            results @required(action: THROW) {
              __typename
              ...GallerySearchResultSectionFragment
            }
          }
        }
        searchCommunities(query: $query) {
          __typename
          ... on SearchCommunitiesPayload {
            __typename
            results @required(action: THROW) {
              __typename
              ...CommunitySearchResultSectionFragment
            }
          }
        }
      }
    `,
    { query: deferredKeyword }
  );

  const isLoading = keyword !== deferredKeyword;

  const isEmpty = useMemo(() => {
    if (
      query.searchUsers?.__typename === 'SearchUsersPayload' &&
      query.searchGalleries?.__typename === 'SearchGalleriesPayload' &&
      query.searchCommunities?.__typename === 'SearchCommunitiesPayload'
    ) {
      return (
        query.searchUsers?.results?.length === 0 &&
        query.searchGalleries?.results?.length === 0 &&
        query.searchCommunities?.results?.length === 0
      );
    }

    return false;
  }, [query]);

  if (isEmpty) {
    return (
      <StyledSearchResultContainer isLoading={isLoading}>
        <StyledNoResultContainer align="center" justify="center">
          <TitleDiatypeL>Nothing Found</TitleDiatypeL>
        </StyledNoResultContainer>
      </StyledSearchResultContainer>
    );
  }

  // if there is filter, show only that filter
  if (activeFilter === 'curator') {
    return (
      <StyledSearchResultContainer isLoading={isLoading}>
        {query?.searchUsers?.__typename === 'SearchUsersPayload' && (
          <UserSearchResultSection
            title="curators"
            queryRef={query?.searchUsers?.results}
            onChangeFilter={onChangeFilter}
            isShowAll
          />
        )}
      </StyledSearchResultContainer>
    );
  }

  if (activeFilter === 'gallery') {
    return (
      <StyledSearchResultContainer isLoading={isLoading}>
        {query?.searchGalleries?.__typename === 'SearchGalleriesPayload' && (
          <GallerySearchResultSection
            title="galleries"
            queryRef={query?.searchGalleries?.results}
            onChangeFilter={onChangeFilter}
            isShowAll
          />
        )}
      </StyledSearchResultContainer>
    );
  }

  if (activeFilter === 'community') {
    return (
      <StyledSearchResultContainer isLoading={isLoading}>
        {query?.searchCommunities?.__typename === 'SearchCommunitiesPayload' && (
          <CommunitySearchResultSection
            title="communities"
            queryRef={query?.searchCommunities?.results}
            onChangeFilter={onChangeFilter}
            isShowAll
          />
        )}
      </StyledSearchResultContainer>
    );
  }

  // show all
  return (
    <StyledSearchResultContainer isLoading={isLoading}>
      {query?.searchUsers?.__typename === 'SearchUsersPayload' && (
        <UserSearchResultSection
          title="curators"
          queryRef={query?.searchUsers?.results}
          onChangeFilter={onChangeFilter}
        />
      )}
      {query?.searchGalleries?.__typename === 'SearchGalleriesPayload' && (
        <GallerySearchResultSection
          title="galleries"
          queryRef={query?.searchGalleries?.results}
          onChangeFilter={onChangeFilter}
        />
      )}
      {query?.searchCommunities?.__typename === 'SearchCommunitiesPayload' && (
        <CommunitySearchResultSection
          title="communities"
          queryRef={query?.searchCommunities?.results}
          onChangeFilter={onChangeFilter}
        />
      )}
    </StyledSearchResultContainer>
  );
}

const StyledSearchResultContainer = styled(VStack)<{ isLoading: boolean }>`
  height: 100%;

  ${({ isLoading }) =>
    isLoading &&
    css`
      opacity: 0.5;
    `}
`;

const StyledNoResultContainer = styled(VStack)`
  height: 100%;
`;
