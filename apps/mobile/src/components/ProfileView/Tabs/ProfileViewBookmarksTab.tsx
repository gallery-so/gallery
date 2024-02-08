import { ListRenderItem } from '@shopify/flash-list';
import { useCallback, useMemo } from 'react';
import { Text, View } from 'react-native';
import { Tabs } from 'react-native-collapsible-tab-view';
import { graphql, useFragment, usePaginationFragment } from 'react-relay';

import { useListContentStyle } from './useListContentStyle';
import { removeNullValues } from 'shared/relay/removeNullValues';
import ProfileViewBookmarkItem from '../ProfileViewBookmarkItem';

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
                  id
                  ...ProfileViewBookmarkItemFragment
                }
              }
            }
          }
        }
      }
    `,
    queryRef
  );

  const contentContainerStyle = useListContentStyle();
  const user = query.userByUsername;
  const bookmarkedTokens = useMemo(() => {
    const tokens = [];

    for (const token of user.tokensBookmarked?.edges ?? []) {
      if (token?.node) {
        tokens.push(token.node);
      }
    }

    return tokens;
  }, [user.tokensBookmarked?.edges]);

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
    // return removeNullValues(user.tokensBookmarked);
    groupedTokens.forEach((row) => {
      items.push({ kind: 'bookmark-row', bookmarkedTokens: row });
    });
    return items;
  }, [groupedTokens]);

  const renderItem = useCallback<ListRenderItem<ListItem>>(({ item }) => {
    if (item.kind === 'header') {
      return (
        <View className="flex flex-row items-center justify-center py-3" style={{ gap: 10 }}>
          <Text>Bookmarks</Text>
        </View>
      );
    }

    if (item.kind === 'bookmark-row') {
      console.log(item.bookmarkedTokens.length);
      return (
        // <View className="flex">
        <View className="flex flex-row space-x-2 w-full justify-center px-4 mb-4">
          {item.bookmarkedTokens.map((bookmarkedToken) => {
            return <ProfileViewBookmarkItem tokenRef={bookmarkedToken} />;
          })}
          {/* <View className="border border-black flex flex-1">
              <Text>test</Text>
            </View>
            <View className="border border-black flex flex-1">
              <Text>test</Text>
            </View> */}
        </View>
        // </View>
      );
    }

    return null;
  }, []);

  const loadMore = useCallback(() => {
    if (hasNext) {
      loadNext(BOOKMARKS_PER_PAGE);
    }
  }, [hasNext, loadNext]);

  return (
    <View style={contentContainerStyle}>
      <Tabs.FlashList
        // ref={ref}
        data={items}
        renderItem={renderItem}
        estimatedItemSize={100}
        onEndReached={loadMore}
      />
    </View>
  );
}
