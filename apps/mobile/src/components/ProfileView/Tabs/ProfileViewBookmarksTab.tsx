import { ListRenderItem } from '@shopify/flash-list';
import { useCallback, useMemo } from 'react';
import { Text, View } from 'react-native';
import { Tabs } from 'react-native-collapsible-tab-view';
import { graphql, usePaginationFragment } from 'react-relay';

import { ProfileViewBookmarkItemFragment$key } from '~/generated/ProfileViewBookmarkItemFragment.graphql';
import { ProfileViewBookmarksTabFragment$key } from '~/generated/ProfileViewBookmarksTabFragment.graphql';

import ProfileViewBookmarkItem from '../ProfileViewBookmarkItem';
import { useListContentStyle } from './useListContentStyle';
import { Typography } from '~/components/Typography';
import { BookmarkIcon } from 'src/icons/BookmarkIcon';

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

  const renderItem = useCallback<ListRenderItem<ListItem>>(({ item }) => {
    if (item.kind === 'header') {
      return (
        <View className="flex flex-row px-4 pb-4 justify-start items-start" style={{ gap: 10 }}>
          <Typography className="text-md" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
            Bookmarks
          </Typography>
          <BookmarkIcon />
        </View>
      );
    }

    if (item.kind === 'bookmark-row') {
      return (
        // <View className="flex">
        <View className="flex flex-row space-x-2 w-full justify-center px-4 mb-4">
          {/* {item.bookmarkedTokens.map((bookmarkedToken) => {
            return <ProfileViewBookmarkItem queryRef={query} tokenRef={bookmarkedToken} />;
          })} */}

          <ProfileViewBookmarkItem queryRef={query} tokenRef={item.bookmarkedTokens[0]} />
          <View className="w-4" />
          <ProfileViewBookmarkItem queryRef={query} tokenRef={item.bookmarkedTokens[1]} />
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
