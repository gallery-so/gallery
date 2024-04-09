import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useCallback, useMemo } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { SearchDefaultFragment$key } from '~/generated/SearchDefaultFragment.graphql';
import { UserSearchResultFragment$key } from '~/generated/UserSearchResultFragment.graphql';
import { TrendingUserCardFragment$key } from '~/generated/TrendingUserCardFragment.graphql';

import { Typography } from '../Typography';
import { UserSearchResult } from './User/UserSearchResult';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import { TrendingUserCard } from '../Trending/TrendingUserCard';

type Props = {
  queryRef: SearchDefaultFragment$key;
  blurInputFocus: () => void;
  keyword: string;
};

type ListItemType =
  | { kind: 'header'; title: string }
  | { kind: 'user'; user: UserSearchResultFragment$key }
  | { kind: 'userCardRow'; users: [] };

export function SearchDefault({ queryRef, blurInputFocus, keyword }: Props) {
  const query = useFragment(
    graphql`
      fragment SearchDefaultFragment on Query {
        ...TrendingUserCardQueryFragment
        trendingUsers5Days: trendingUsers(input: { report: LAST_5_DAYS }) {
          ... on TrendingUsersPayload {
            __typename
            users {
              galleries {
                tokenPreviews {
                  __typename
                }
              }

              ...UserSearchResultFragment
              ...TrendingUserCardFragment
            }
          }
        }
        viewer @required(action: THROW) {
          ... on Viewer {
            suggestedUsers(first: 2) @required(action: THROW) {
              __typename
              edges {
                node {
                  __typename
                  ... on GalleryUser {
                    galleries {
                      tokenPreviews {
                        __typename
                      }
                    }

                    ...UserSearchResultFragment
                  }
                  ...TrendingUserCardFragment
                }
              }
            }
          }
        }
      }
    `,
    queryRef
  );

  const { width } = useWindowDimensions();

  const CARD_HEIGHT = 145;
  const CARD_WIDTH = 185;

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
      } else if (item.kind === 'userCardRow') {
        return (
          <View className="flex flex-row justify-around">
            {item?.users?.map((user, idx) => {
              return (
                <View className="mb-1 " style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}>
                  <TrendingUserCard
                    key={idx}
                    userRef={user}
                    queryRef={query}
                    showFollowButton={false}
                  />
                </View>
              );
            })}
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

    let suggestedUsers = [];
    if (query.viewer?.suggestedUsers?.__typename === 'UsersConnection') {
      for (const edge of query.viewer?.suggestedUsers?.edges ?? []) {
        if (edge?.node) {
          suggestedUsers.push(edge.node);
        }
      }
    }
    if (suggestedUsers) {
      items.push({
        kind: 'header',
        title: 'Trending Collectors and Creators',
      });
      items.push({
        kind: 'userCardRow',
        users: suggestedUsers?.slice(0, 2),
      });
    }

    if (
      query.trendingUsers5Days?.__typename === 'TrendingUsersPayload' &&
      query.trendingUsers5Days.users
    ) {
      const { users } = query.trendingUsers5Days;

      const usersWithTokenPreviews = users.filter((user) => {
        return user?.galleries?.find(
          (gallery) => removeNullValues(gallery?.tokenPreviews).length > 0
        );
      });

      if (usersWithTokenPreviews) {
        items.push({
          kind: 'header',
          title: 'Suggested Collectors and Creators',
        });
        items.push({
          kind: 'userCardRow',
          users: usersWithTokenPreviews?.slice(0, 2),
        });
      }

      items.push({
        kind: 'header',
        title: 'Trending Curators',
      });
      for (const user of users) {
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
      <View
        className="flex flex-row flex-wrap justify-between"
        style={{ width: width - 24 }}
      ></View>

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
