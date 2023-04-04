import { useDeferredValue } from 'react';
import { View } from 'react-native';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { SearchResultsQuery } from '~/generated/SearchResultsQuery.graphql';

import { SearchFilterType } from './SearchFilter';
import { UserSearchResultSection } from './User/UserSearchResultSection';

type Props = {
  activeFilter: SearchFilterType;
  keyword: string;
  onChangeFilter: (filter: SearchFilterType) => void;
};

export function SearchResults({ activeFilter, keyword, onChangeFilter }: Props) {
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
        # searchGalleries(query: $query) {
        #   __typename
        #   ... on SearchGalleriesPayload {
        #     __typename
        #     results @required(action: THROW) {
        #       __typename
        #       #  ...GallerySearchResultSectionFragment
        #     }
        #   }
        # }
      }
    `,
    { query: deferredKeyword }
  );

  if (activeFilter === 'curator') {
    return (
      <View>
        {query?.searchUsers?.__typename === 'SearchUsersPayload' && (
          <UserSearchResultSection
            queryRef={query.searchUsers.results}
            isShowingAll
            onChangeFilter={onChangeFilter}
          />
        )}
      </View>
    );
  }

  return (
    <View>
      {query?.searchUsers?.__typename === 'SearchUsersPayload' && (
        <UserSearchResultSection
          queryRef={query.searchUsers.results}
          onChangeFilter={onChangeFilter}
        />
      )}
    </View>
  );
}
