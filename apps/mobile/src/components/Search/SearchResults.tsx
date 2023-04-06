import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useCallback, useDeferredValue, useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { GallerySearchResultFragment$key } from '~/generated/GallerySearchResultFragment.graphql';
import { SearchResultsQuery } from '~/generated/SearchResultsQuery.graphql';
import { UserSearchResultFragment$key } from '~/generated/UserSearchResultFragment.graphql';

import { Typography } from '../Typography';
import { GallerySearchResult } from './Gallery/GallerySearchResult';
import { GallerySearchResultSection } from './Gallery/GallerySearchResultSection';
import { useSearchContext } from './SearchContext';
import { SearchFilterType } from './SearchFilter';
import { SearchSection } from './SearchSection';
import { UserSearchResult } from './User/UserSearchResult';
import { UserSearchResultSection } from './User/UserSearchResultSection';

type SearchListItem =
  | {
      kind: 'search-section-header';
      sectionType: 'curators' | 'galleries';
      sectionTitle: string;
      numberOfResults: number;
    }
  | {
      kind: 'user-search-result';
      user: UserSearchResultFragment$key;
    }
  | {
      kind: 'gallery-search-result';
      gallery: GallerySearchResultFragment$key;
    };

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
              user {
                ...UserSearchResultFragment
              }
            }
          }
        }
        searchGalleries(query: $query) {
          __typename
          ... on SearchGalleriesPayload {
            __typename
            results @required(action: THROW) {
              __typename
              gallery {
                ...GallerySearchResultFragment
              }
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

  const items = useMemo((): SearchListItem[] => {
    const items: SearchListItem[] = [];

    const searchUsers = query.searchUsers;
    const searchGalleries = query.searchGalleries;

    if (searchUsers?.__typename === 'SearchUsersPayload' && searchUsers.results.length > 0) {
      items.push({
        kind: 'search-section-header',
        sectionType: 'curators',
        sectionTitle: 'Curators',
        numberOfResults: searchUsers.results.length,
      });

      for (const result of searchUsers.results) {
        if (result.user) {
          items.push({ kind: 'user-search-result', user: result.user });
        }
      }
    }

    if (
      searchGalleries?.__typename === 'SearchGalleriesPayload' &&
      searchGalleries.results.length > 0
    ) {
      items.push({
        kind: 'search-section-header',
        sectionType: 'galleries',
        sectionTitle: 'Galleries',
        numberOfResults: searchGalleries.results.length,
      });

      for (const result of searchGalleries.results) {
        if (result.gallery) {
          items.push({ kind: 'gallery-search-result', gallery: result.gallery });
        }
      }
    }

    return items;
  }, [query.searchGalleries, query.searchUsers]);

  const renderItem = useCallback<ListRenderItem<SearchListItem>>(({ item }) => {
    if (item.kind === 'search-section-header') {
      return <SearchSection title={item.sectionType} onShowAll={() => {}} numResults={5} />;
    } else if (item.kind === 'user-search-result') {
      return <UserSearchResult userRef={item.user} />;
    } else if (item.kind === 'gallery-search-result') {
      return <GallerySearchResult galleryRef={item.gallery} />;
    }

    return <View />;
  }, []);

  if (isEmpty) {
    return (
      <View className={`h-full  ${isLoading ? 'opacity-50' : 'opacity-100'} `}>
        <View className="flex-1 items-center justify-center">
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

  return (
    <View className="flex-1">
      <FlashList renderItem={renderItem} data={items} estimatedItemSize={40} />
    </View>
  );
}

type LoadingWrapperProps = {
  children: React.ReactNode;
  isLoading: boolean;
};

const LoadingWrapper = ({ children, isLoading }: LoadingWrapperProps) => (
  <View className={`${isLoading ? 'opacity-50' : 'opacity-100'} `}>{children}</View>
);
