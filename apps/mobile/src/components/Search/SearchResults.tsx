import { useDeferredValue, useMemo } from 'react';
import { View } from 'react-native';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { SearchResultsQuery } from '~/generated/SearchResultsQuery.graphql';

import { Typography } from '../Typography';
import { GallerySearchResultSection } from './Gallery/GallerySearchResultSection';
import { useSearchContext } from './SearchContext';
import { SearchFilterType } from './SearchFilter';
import { UserSearchResultSection } from './User/UserSearchResultSection';

type Props = {
  activeFilter: SearchFilterType;
  onChangeFilter: (filter: SearchFilterType) => void;
};

export function SearchResults({ activeFilter, onChangeFilter }: Props) {
  const { keyword } = useSearchContext();
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
      }
    `,
    { query: deferredKeyword }
  );

  const isLoading = keyword !== deferredKeyword;

  const isEmpty = useMemo(() => {
    if (
      query.searchUsers?.__typename === 'SearchUsersPayload' &&
      query.searchGalleries?.__typename === 'SearchGalleriesPayload'
    ) {
      return (
        query.searchUsers?.results?.length === 0 && query.searchGalleries?.results?.length === 0
      );
    }

    return false;
  }, [query]);

  if (isEmpty) {
    return (
      <View className={`h-full ${isLoading ? 'opacity-50' : 'opacity-100'} `}>
        <View className="flex flex-1 items-center justify-center">
          <Typography
            font={{
              family: 'ABCDiatype',
              weight: 'Bold',
            }}
            className="text-lg"
          >
            No Results
          </Typography>
        </View>
      </View>
    );
  }

  if (activeFilter === 'curator') {
    return (
      <LoadingWrapper isLoading={isLoading}>
        {query?.searchUsers?.__typename === 'SearchUsersPayload' && (
          <UserSearchResultSection
            queryRef={query.searchUsers.results}
            isShowingAll
            onChangeFilter={onChangeFilter}
          />
        )}
      </LoadingWrapper>
    );
  }

  if (activeFilter === 'gallery') {
    return (
      <LoadingWrapper isLoading={isLoading}>
        {query?.searchGalleries?.__typename === 'SearchGalleriesPayload' && (
          <GallerySearchResultSection
            queryRef={query.searchGalleries.results}
            isShowingAll
            onChangeFilter={onChangeFilter}
          />
        )}
      </LoadingWrapper>
    );
  }

  return (
    <LoadingWrapper isLoading={isLoading}>
      {query?.searchUsers?.__typename === 'SearchUsersPayload' && (
        <UserSearchResultSection
          queryRef={query.searchUsers.results}
          onChangeFilter={onChangeFilter}
        />
      )}
      {query?.searchGalleries?.__typename === 'SearchGalleriesPayload' && (
        <GallerySearchResultSection
          queryRef={query?.searchGalleries?.results}
          onChangeFilter={onChangeFilter}
        />
      )}
    </LoadingWrapper>
  );
}

type LoadingWrapperProps = {
  children: React.ReactNode;
  isLoading: boolean;
};

const LoadingWrapper = ({ children, isLoading }: LoadingWrapperProps) => (
  <View className={`${isLoading ? 'opacity-50' : 'opacity-100'} `}>{children}</View>
);
