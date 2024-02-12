import { useNavigation } from '@react-navigation/native';
import { ListRenderItem } from '@shopify/flash-list';
import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { Tabs } from 'react-native-collapsible-tab-view';
import { graphql, usePaginationFragment } from 'react-relay';
import { contexts } from 'shared/analytics/constants';
import { BookmarkIcon } from 'src/icons/BookmarkIcon';

import { Button } from '~/components/Button';
import { Typography } from '~/components/Typography';
import { ProfileViewBookmarkItemFragment$key } from '~/generated/ProfileViewBookmarkItemFragment.graphql';
import { ProfileViewBookmarksTabFragment$key } from '~/generated/ProfileViewBookmarksTabFragment.graphql';
import { RootStackNavigatorProp } from '~/navigation/types';

import ProfileViewBookmarkItem from '../ProfileViewBookmarkItem';
import { useListContentStyle } from './useListContentStyle';

type Props = {
  queryRef: ProfileViewBookmarksTabFragment$key;
};

type ListItem =
  | { kind: 'header' }
  | { kind: 'bookmark-row'; bookmarkedTokens: ProfileViewBookmarkItemFragment$key[] };

const BOOKMARKS_PER_PAGE = 24;

export function ProfileViewBookmarksTab({ queryRef }: Props) {
  const {
    data: query,
    hasNext,
    loadNext,
  } = usePaginationFragment(
    graphql`
      fragment ProfileViewBookmarksTabFragment on Query
      @refetchable(queryName: "ProfileViewBookmarksTabFragmentPaginationQuery") {
        userByUsername(username: $username) {
          ... on GalleryUser {
            tokensBookmarked(first: $bookmarksFirst, after: $bookmarksAfter)
              @connection(key: "ProfileViewBookmarksTab_tokensBookmarked") {
              edges {
                node {
                  ...ProfileViewBookmarkItemFragment
                }
              }
            }
          }
        }
        ...ProfileViewBookmarkItemQueryFragment
      }
    `,
    queryRef
  );

  const contentContainerStyle = useListContentStyle();
  const user = query.userByUsername;
  const bookmarkedTokens = useMemo(() => {
    const tokens = [];
    if (!user || !user.tokensBookmarked) {
      return [];
    }

    for (const token of user.tokensBookmarked?.edges ?? []) {
      if (token?.node) {
        tokens.push(token.node);
      }
    }

    return tokens;
  }, [user]);

  // group tokens into rows so they can be virtualized
  const groupedTokens = useMemo(() => {
    const itemsPerRow = 2;
    const result = [];
    for (let i = 0; i < bookmarkedTokens.length; i += itemsPerRow) {
      const row = bookmarkedTokens.slice(i, i + itemsPerRow);
      result.push(row);
    }
    return result;
  }, [bookmarkedTokens]);

  const items = useMemo<ListItem[]>(() => {
    const items: ListItem[] = [];
    items.push({ kind: 'header' });

    groupedTokens.forEach((row) => {
      items.push({ kind: 'bookmark-row', bookmarkedTokens: row });
    });
    return items;
  }, [groupedTokens]);

  const renderItem = useCallback<ListRenderItem<ListItem>>(
    ({ item }) => {
      if (item.kind === 'header') {
        return (
          <View className="flex flex-row px-4 pb-4 justify-start items-center" style={{ gap: 10 }}>
            <Typography className="text-md" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
              Bookmarks
            </Typography>
            <BookmarkIcon colorTheme="black" active width={20} />
          </View>
        );
      }

      if (item.kind === 'bookmark-row') {
        return (
          // Note to dev: If you're adjusting the horizontal spacing between row items, be sure to adjust the dimension calculation in ProfileViewBookmarkItem
          <View className="flex flex-row w-full justify-center px-4 mb-6">
            {item.bookmarkedTokens[0] && (
              <ProfileViewBookmarkItem queryRef={query} tokenRef={item.bookmarkedTokens[0]} />
            )}
            <View className="w-4" />
            {item.bookmarkedTokens[1] && (
              <ProfileViewBookmarkItem queryRef={query} tokenRef={item.bookmarkedTokens[1]} />
            )}
          </View>
        );
      }

      return null;
    },
    [query]
  );

  const loadMore = useCallback(() => {
    if (hasNext) {
      loadNext(BOOKMARKS_PER_PAGE);
    }
  }, [hasNext, loadNext]);

  const navigation = useNavigation<RootStackNavigatorProp>();
  const onExplorePress = useCallback(() => {
    navigation.navigate('MainTabs', {
      screen: 'HomeTab',
      params: { screen: 'Home', params: { screen: 'For You', params: {} } },
    });
  }, [navigation]);

  return (
    <View style={contentContainerStyle}>
      {items.length > 0 ? (
        <Tabs.FlashList
          data={items}
          renderItem={renderItem}
          estimatedItemSize={100}
          onEndReached={loadMore}
        />
      ) : (
        <Tabs.ScrollView>
          <View className="flex px-4">
            <View className="flex flex-row mb-12  justify-start items-center" style={{ gap: 10 }}>
              <Typography className="text-md" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
                Bookmarks
              </Typography>
              <BookmarkIcon colorTheme="black" active width={20} />
            </View>
            <Typography
              font={{
                family: 'GTAlpina',
                weight: 'StandardLight',
              }}
              className="text-center text-xl mb-6"
            >
              You haven’t Bookmarked anything yet! Tap the Bookmark icon on work you like to build
              your collection.
            </Typography>
            <Button
              text="Start Exploring"
              eventElementId="Profile Bookmarks Tab Empty State Start Exploring Button"
              eventName="Pressed Profile Bookmarks Tab Empty State Start Exploring Button"
              eventContext={contexts.Bookmarks}
              onPress={onExplorePress}
            />
          </View>
        </Tabs.ScrollView>
      )}
    </View>
  );
}
