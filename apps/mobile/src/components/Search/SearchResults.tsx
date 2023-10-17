import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useCallback, useDeferredValue, useMemo } from 'react';
import { View } from 'react-native';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { MentionType } from 'src/hooks/useMentionableMessage';

import { CommunitySearchResultFragment$key } from '~/generated/CommunitySearchResultFragment.graphql';
import { GallerySearchResultFragment$key } from '~/generated/GallerySearchResultFragment.graphql';
import { SearchResultsQuery } from '~/generated/SearchResultsQuery.graphql';
import { UserSearchResultFragment$key } from '~/generated/UserSearchResultFragment.graphql';
import { noop } from '~/shared/utils/noop';

import { Typography } from '../Typography';
import { CommunitySearchResult } from './Community/CommunitySearchResult';
import { NUM_PREVIEW_SEARCH_RESULTS } from './constants';
import { GallerySearchResult } from './Gallery/GallerySearchResult';
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
    }
  | {
      kind: 'community-search-result';
      community: CommunitySearchResultFragment$key;
    };

type Props = {
  keyword: string;
  activeFilter: SearchFilterType;
  onChangeFilter: (filter: SearchFilterType) => void;
  blurInputFocus: () => void;
  onSelect?: (item: MentionType) => void;

  onlyShowTopResults?: boolean;
  isMentionSearch?: boolean;
};

export function SearchResults({
  activeFilter,
  keyword,
  onChangeFilter,
  blurInputFocus,
  onSelect = noop,
  onlyShowTopResults = false,
  isMentionSearch = false,
}: Props) {
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
        searchCommunities(query: $query) {
          __typename
          ... on SearchCommunitiesPayload {
            __typename
            results @required(action: THROW) {
              __typename
              community {
                ...CommunitySearchResultFragment
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
  const searchCommunities = query.searchCommunities;

  const hasUsers = searchUsers?.__typename === 'SearchUsersPayload';
  const hasGalleries = searchGalleries?.__typename === 'SearchGalleriesPayload';
  const hasCommunities = searchCommunities?.__typename === 'SearchCommunitiesPayload';

  const isEmpty = useMemo(() => {
    if (activeFilter === 'top') {
      return (
        hasUsers &&
        hasGalleries &&
        hasCommunities &&
        searchUsers.results.length === 0 &&
        searchGalleries.results.length === 0 &&
        searchCommunities.results.length === 0
      );
    }

    if (activeFilter === 'curator' && hasUsers) {
      return searchUsers.results.length === 0;
    }

    if (activeFilter === 'gallery' && hasGalleries) {
      return searchGalleries.results.length === 0;
    }

    if (activeFilter === 'community' && hasCommunities) {
      return searchCommunities.results.length === 0;
    }

    return true;
  }, [
    activeFilter,
    hasCommunities,
    hasGalleries,
    hasUsers,
    searchCommunities,
    searchGalleries,
    searchUsers,
  ]);

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
    } else if (activeFilter === 'community' && hasCommunities) {
      items.push({
        kind: 'search-section-header',
        sectionType: 'community',
        sectionTitle: 'Communities',
        numberOfResults: searchCommunities.results.length,
      });

      for (const result of searchCommunities.results) {
        if (result.community) {
          items.push({
            kind: 'community-search-result',
            community: result.community,
          });
        }
      }
    }

    // if there is no active filter, show both curators and galleries
    // but only show a preview of the results
    else if (activeFilter === 'top') {
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

      if (hasGalleries && !isMentionSearch) {
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

      if (hasCommunities) {
        items.push({
          kind: 'search-section-header',
          sectionType: 'community',
          sectionTitle: 'Communities',
          numberOfResults: searchCommunities.results.length,
        });

        const results = searchCommunities.results.slice(0, NUM_PREVIEW_SEARCH_RESULTS);
        for (const result of results) {
          if (result.community) {
            items.push({
              kind: 'community-search-result',
              community: result.community,
            });
          }
        }
      }
    }

    return items;
  }, [
    activeFilter,
    hasCommunities,
    hasGalleries,
    hasUsers,
    isMentionSearch,
    searchCommunities,
    searchGalleries,
    searchUsers,
  ]);

  const showAllButton = useMemo(
    () => (sectionType: SearchFilterType) => {
      if (onlyShowTopResults) return true;

      return activeFilter === sectionType;
    },
    [activeFilter, onlyShowTopResults]
  );

  const renderItem = useCallback<ListRenderItem<SearchListItem>>(
    ({ item }) => {
      if (item.kind === 'search-section-header') {
        return (
          <SearchSection
            title={item.sectionTitle}
            onShowAll={() => onChangeFilter(item.sectionType)}
            numResults={item.numberOfResults}
            isShowAll={showAllButton(item.sectionType)}
          />
        );
      } else if (item.kind === 'user-search-result') {
        return <UserSearchResult userRef={item.user} onSelect={onSelect} />;
      } else if (item.kind === 'gallery-search-result') {
        return <GallerySearchResult galleryRef={item.gallery} />;
      } else if (item.kind === 'community-search-result') {
        return <CommunitySearchResult communityRef={item.community} onSelect={onSelect} />;
      }

      return <View />;
    },
    [onChangeFilter, onSelect, showAllButton]
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
      <FlashList
        keyboardShouldPersistTaps="always"
        data={items}
        estimatedItemSize={40}
        renderItem={renderItem}
        onTouchStart={blurInputFocus}
      />
    </View>
  );
}
