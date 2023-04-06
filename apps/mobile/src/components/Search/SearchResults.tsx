import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useCallback, useDeferredValue, useMemo } from 'react';
import { View } from 'react-native';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { GallerySearchResultFragment$key } from '~/generated/GallerySearchResultFragment.graphql';
import { SearchResultsQuery } from '~/generated/SearchResultsQuery.graphql';
import { UserSearchResultFragment$key } from '~/generated/UserSearchResultFragment.graphql';

import { Typography } from '../Typography';
import { NUM_PREVIEW_SEARCH_RESULTS } from './constants';
import { GallerySearchResult } from './Gallery/GallerySearchResult';
import { useSearchContext } from './SearchContext';
import { SearchFilterType } from './SearchFilter';
import { SearchSection } from './SearchSection';
import { UserSearchResult } from './User/UserSearchResult';

type SearchListItem =
  | {
      kind: 'search-section-header';
      sectionType: SearchFilterType;
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
  const searchUsers = query.searchUsers;
  const searchGalleries = query.searchGalleries;

  const hasUsers = searchUsers?.__typename === 'SearchUsersPayload';
  const hasGalleries = searchGalleries?.__typename === 'SearchGalleriesPayload';

  const isEmpty = useMemo(() => {
    if (!activeFilter) {
      return (
        hasUsers &&
        hasGalleries &&
        searchUsers.results.length === 0 &&
        searchGalleries.results.length === 0
      );
    }

    if (activeFilter === 'curator' && hasUsers) {
      return searchUsers.results.length === 0;
    }

    if (activeFilter === 'gallery' && hasGalleries) {
      return searchGalleries.results.length === 0;
    }

    return true;
  }, [activeFilter, hasGalleries, hasUsers, searchGalleries, searchUsers]);

  const items = useMemo((): SearchListItem[] => {
    const items: SearchListItem[] = [];

    if (activeFilter === 'curator' && hasUsers) {
      items.push({
        kind: 'search-section-header',
        sectionType: 'curator',
        sectionTitle: 'Curators',
        numberOfResults: searchUsers.results.length,
      });

      for (const result of searchUsers.results) {
        if (result.user) {
          items.push({
            kind: 'user-search-result',
            user: result.user,
          });
        }
      }
    } else if (activeFilter === 'gallery' && hasGalleries) {
      items.push({
        kind: 'search-section-header',
        sectionType: 'gallery',
        sectionTitle: 'Galleries',
        numberOfResults: searchGalleries.results.length,
      });

      for (const result of searchGalleries.results) {
        if (result.gallery) {
          items.push({
            kind: 'gallery-search-result',
            gallery: result.gallery,
          });
        }
      }

      // if there is no active filter, show both curators and galleries
      // but only show a preview of the results
    } else if (!activeFilter) {
      if (hasUsers) {
        items.push({
          kind: 'search-section-header',
          sectionType: 'curator',
          sectionTitle: 'Curators',
          numberOfResults: searchUsers.results.length,
        });
        const results = searchUsers.results.slice(0, NUM_PREVIEW_SEARCH_RESULTS);
        for (const result of results) {
          if (result.user) {
            items.push({
              kind: 'user-search-result',
              user: result.user,
            });
          }
        }
      }

      if (hasGalleries) {
        items.push({
          kind: 'search-section-header',
          sectionType: 'gallery',
          sectionTitle: 'Galleries',
          numberOfResults: searchGalleries.results.length,
        });

        const results = searchGalleries.results.slice(0, NUM_PREVIEW_SEARCH_RESULTS);
        for (const result of results) {
          if (result.gallery) {
            items.push({
              kind: 'gallery-search-result',
              gallery: result.gallery,
            });
          }
        }
      }
    }

    return items;
  }, [activeFilter, hasGalleries, hasUsers, searchGalleries, searchUsers]);

  const renderItem = useCallback<ListRenderItem<SearchListItem>>(
    ({ item }) => {
      if (item.kind === 'search-section-header') {
        return (
          <SearchSection
            title={item.sectionTitle}
            onShowAll={() => onChangeFilter(item.sectionType)}
            numResults={item.numberOfResults}
            isShowAll={activeFilter === item.sectionType}
          />
        );
      } else if (item.kind === 'user-search-result') {
        return <UserSearchResult userRef={item.user} />;
      } else if (item.kind === 'gallery-search-result') {
        return <GallerySearchResult galleryRef={item.gallery} />;
      }

      return <View />;
    },
    [activeFilter, onChangeFilter]
  );

  if (isEmpty) {
    return (
      <View
        className={`flex-1 items-center justify-center ${
          isLoading ? 'opacity-50' : 'opacity-100'
        } `}
      >
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
    );
  }

  return (
    <View className={`flex-1 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
      <FlashList data={items} estimatedItemSize={40} renderItem={renderItem} />
    </View>
  );
}
