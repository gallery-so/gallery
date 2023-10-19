import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { SearchDefaultFragment$key } from '~/generated/SearchDefaultFragment.graphql';
import { UserSearchResultFragment$key } from '~/generated/UserSearchResultFragment.graphql';

import { Typography } from '../Typography';
import { UserSearchResult } from './User/UserSearchResult';

type Props = {
  queryRef: SearchDefaultFragment$key;
  blurInputFocus: () => void;
  keyword: string;
};

type ListItemType =
  | { kind: 'header'; title: string }
  | { kind: 'user'; user: UserSearchResultFragment$key };

export function SearchDefault({ queryRef, blurInputFocus, keyword }: Props) {
  const query = useFragment(
    graphql`
      fragment SearchDefaultFragment on Query {
        trendingUsers5Days: trendingUsers(input: { report: LAST_5_DAYS }) {
          ... on TrendingUsersPayload {
            __typename
            users {
              ...UserSearchResultFragment
            }
          }
        }
      }
    `,
    queryRef
  );

  const renderItem = useCallback<ListRenderItem<ListItemType>>(
    ({ item }) => {
      if (item.kind === 'header') {
        return (
          <View className="p-4">
            <Typography
              font={{
                family: 'ABCDiatype',
                weight: 'Medium',
              }}
              className="text-metal text-xs uppercase"
            >
              {item.title}
            </Typography>
          </View>
        );
      } else {
        return <UserSearchResult userRef={item.user} keyword={keyword} />;
      }
    },
    [keyword]
  );

  const items = useMemo((): ListItemType[] => {
    const items: ListItemType[] = [];
    items.push({
      kind: 'header',
      title: 'Trending Curators',
    });
    if (
      query.trendingUsers5Days?.__typename === 'TrendingUsersPayload' &&
      query.trendingUsers5Days.users
    ) {
      for (const user of query.trendingUsers5Days.users) {
        items.push({
          kind: 'user',
          user,
        });
      }
    }
    return items;
  }, [query]);

  return (
    <View className="flex-grow">
      <FlashList
        keyboardShouldPersistTaps="always"
        data={items}
        estimatedItemSize={25}
        renderItem={renderItem}
        onTouchStart={blurInputFocus}
      />
    </View>
  );
}
