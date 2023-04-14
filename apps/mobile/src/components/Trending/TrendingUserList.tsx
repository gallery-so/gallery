import { useCallback, useMemo } from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { TrendingUserCardFragment$key } from '~/generated/TrendingUserCardFragment.graphql';
import { TrendingUserListFragment$key } from '~/generated/TrendingUserListFragment.graphql';
import { TrendingUserListQueryFragment$key } from '~/generated/TrendingUserListQueryFragment.graphql';

import { TrendingUserCard } from './TrendingUserCard';

type Props = {
  usersRef: TrendingUserListFragment$key;
  queryRef: TrendingUserListQueryFragment$key;
};

const PAGE_SIZE = 4;

export function TrendingUserList({ usersRef, queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment TrendingUserListQueryFragment on Query {
        ...TrendingUserCardQueryFragment
      }
    `,
    queryRef
  );

  const users = useFragment(
    graphql`
      fragment TrendingUserListFragment on GalleryUser @relay(plural: true) {
        ...TrendingUserCardFragment
      }
    `,
    usersRef
  );

  const { width } = useWindowDimensions();

  // Format the data into array of arrays of size PAGE_SIZE
  const pages = useMemo(() => {
    const pages = [];

    for (let i = 0; i < users.length; i += PAGE_SIZE) {
      pages.push(users.slice(i, i + PAGE_SIZE));
    }

    return pages;
  }, [users]);

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
  );
}
