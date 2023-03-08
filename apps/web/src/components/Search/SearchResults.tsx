import { graphql, useLazyLoadQuery } from 'react-relay';
import styled from 'styled-components';

import { SearchResultsQuery } from '~/generated/SearchResultsQuery.graphql';

import { VStack } from '../core/Spacer/Stack';
import UserSearchResultSection from './User/UserSearchResultSection';

type Props = {
  keyword: string;
};

export default function SearchResults({ keyword }: Props) {
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
          ... on SearchGalleriesPayload {
            results {
              gallery {
                dbid
                name
                hidden
                owner {
                  id
                  username
                }
              }
            }
          }
        }
        searchCommunities(query: $query) {
          ... on SearchCommunitiesPayload {
            results {
              community {
                dbid
                name
                description
                chain
              }
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
        <UserSearchResultSection title="curators" queryRef={query?.searchUsers?.results} />
      )}
      {/* <SearchResultSection title="galleries" />
      <SearchResultSection title="communities" /> */}
    </StyledSearchResultContainer>
  );
}

const StyledSearchResultContainer = styled(VStack)``;
