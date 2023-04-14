import { useCallback, useMemo } from 'react';
import { ScrollView, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { SuggestedSectionQueryFragment$key } from '~/generated/SuggestedSectionQueryFragment.graphql';
import { TrendingUserCardFragment$key } from '~/generated/TrendingUserCardFragment.graphql';

import { Typography } from '../Typography';
import { TrendingUserCard } from './TrendingUserCard';

type Props = {
  title: string;
  description: string;
  queryRef: SuggestedSectionQueryFragment$key;
};

const PAGE_SIZE = 4;

export function SuggestedSection({ title, description, queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment SuggestedSectionQueryFragment on Query {
        viewer @required(action: THROW) {
          ... on Viewer {
            suggestedUsers(first: 24)
              @connection(key: "ExploreFragment_suggestedUsers")
              @required(action: THROW) {
              edges {
                node {
                  __typename
                  ... on GalleryUser {
                    __typename
                    ...TrendingUserCardFragment
                  }
                }
              }
            }
          }
        }
        ...TrendingUserCardQueryFragment
      }
    `,
    queryRef
  );

  const { width } = useWindowDimensions();

  // map edge nodes to an array of GalleryUsers
  const nonNullUsers = useMemo(() => {
    const users = [];

    for (const edge of query.viewer.suggestedUsers?.edges ?? []) {
      if (edge?.node) {
        users.push(edge.node);
      }
    }

    return users;
  }, [query.viewer.suggestedUsers?.edges]);

  // Format the data into array of arrays of size PAGE_SIZE
  const pages = useMemo(() => {
    const pages = [];

    for (let i = 0; i < nonNullUsers.length; i += PAGE_SIZE) {
      pages.push(nonNullUsers.slice(i, i + PAGE_SIZE));
    }

    return pages;
  }, [nonNullUsers]);

  const renderPage = useCallback(
    (pages: Array<TrendingUserCardFragment$key>) => {
      return (
        <View className="flex max-w-full flex-row flex-wrap justify-between">
          {pages.map((user, index) => (
            <View key={index} className="mb-2 w-[49%]">
              <TrendingUserCard key={index} userRef={user} queryRef={query} />
            </View>
          ))}
        </View>
      );
    },
    [query]
  );

  return (
    <View className="flex-1 px-3">
      <View className="flex flex-row items-end justify-between py-3">
        <View>
          <Typography
            font={{
              family: 'ABCDiatype',
              weight: 'Bold',
            }}
            className="text-lg text-black"
          >
            {title}
          </Typography>
          <Typography
            font={{
              family: 'ABCDiatype',
              weight: 'Bold',
            }}
            className="text-metal text-sm"
          >
            {description}
          </Typography>
        </View>
        <TouchableOpacity onPress={() => {}}>
          <Typography
            font={{
              family: 'ABCDiatype',
              weight: 'Regular',
            }}
            className="text-shadow text-sm underline"
          >
            See all
          </Typography>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        directionalLockEnabled
        pagingEnabled
        decelerationRate="fast"
        snapToAlignment="center"
        scrollEventThrottle={200}
        showsHorizontalScrollIndicator={false}
      >
        {pages.map((page, index) => (
          <View
            key={index}
            style={{
              width: width - 24,
            }}
          >
            {renderPage(page)}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
