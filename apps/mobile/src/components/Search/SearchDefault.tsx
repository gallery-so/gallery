import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { Suspense, useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { SearchDefaultFragment$key } from '~/generated/SearchDefaultFragment.graphql';
import { TrendingUserCardFragment$key } from '~/generated/TrendingUserCardFragment.graphql';
import { UserSearchResultFragment$key } from '~/generated/UserSearchResultFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import { TrendingUserCard } from '../Trending/TrendingUserCard';
import { Typography } from '../Typography';
import { UserSearchResult } from './User/UserSearchResult';
import { UserFollowListFallback } from '../UserFollowList/UserFollowListFallback';

type Props = {
  queryRef: SearchDefaultFragment$key;
  blurInputFocus: () => void;
  keyword: string;
};

type ListItemType =
  | { kind: 'header'; title: string }
  | { kind: 'user'; user: UserSearchResultFragment$key }
  | {
      kind: 'trendingUserCardRow';
      trendingUsers: Array<TrendingUserCardFragment$key>;
    }
  | {
      kind: 'suggestedUserCardRow';
      suggestedUsers: Array<TrendingUserCardFragment$key>;
    };

const CARD_HEIGHT = 145;
const CARD_WIDTH = 185;

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
                    ...TrendingUserCardFragment
                  }
                }
              }
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
      } else if (item.kind === 'trendingUserCardRow') {
        return (
          <View className="flex flex-row justify-around">
            {item?.trendingUsers?.map((user, idx) => {
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
      } else if (item.kind === 'suggestedUserCardRow') {
        return (
          <View className="flex flex-row justify-around">
            {item?.suggestedUsers?.map((user, idx) => {
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
    [query, keyword]
  );

  const items = useMemo((): ListItemType[] => {
    const items: ListItemType[] = [];

    const suggestedUsers = [];
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
        title: 'Suggested Collectors and Creators',
      });
      items.push({
        kind: 'suggestedUserCardRow',
        suggestedUsers: suggestedUsers?.slice(0, 2),
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
          title: 'Trending Collectors and Creators',
        });
        items.push({
          kind: 'trendingUserCardRow',
          trendingUsers: usersWithTokenPreviews?.slice(0, 2),
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
      <Suspense fallback={<UserFollowListFallback />}>
        <FlashList
          keyboardShouldPersistTaps="always"
          data={items}
          estimatedItemSize={25}
          renderItem={renderItem}
          onTouchStart={blurInputFocus}
        />
      </Suspense>
    </View>
  );
}
