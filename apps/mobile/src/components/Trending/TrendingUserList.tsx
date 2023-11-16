import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useCallback, useMemo, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleProp,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { TrendingUserCardFragment$key } from '~/generated/TrendingUserCardFragment.graphql';
import { TrendingUserListFragment$key } from '~/generated/TrendingUserListFragment.graphql';
import { TrendingUserListQueryFragment$key } from '~/generated/TrendingUserListQueryFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

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
        galleries {
          tokenPreviews {
            __typename
          }
        }
      }
    `,
    usersRef
  );

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const { width } = useWindowDimensions();

  // Format the data into array of arrays of size PAGE_SIZE
  const pages = useMemo((): ListItemType[] => {
    const pages: ListItemType[] = [];

    // remove users without token previews
    const usersWithTokenPreviews = users.filter((user) => {
      return user?.galleries?.find(
        (gallery) => removeNullValues(gallery?.tokenPreviews).length > 0
      );
    });

    for (let i = 0; i < users.length; i += PAGE_SIZE) {
      const pageUsers = usersWithTokenPreviews.slice(i, i + PAGE_SIZE);

      pages.push({ kind: 'page', cells: pageUsers });
    }

    return pages;
  }, [users]);

  const isPaginated = pages.length > 1;

  type ListItemType = { kind: 'page'; cells: TrendingUserCardFragment$key[] };

  const renderItem = useCallback<ListRenderItem<ListItemType>>(
    ({ item }) => {
      const CARD_HEIGHT = 175;

      return (
        <View className="flex flex-row flex-wrap justify-between" style={{ width: width - 24 }}>
          {item.cells.map((user, index) => (
            <View key={index} className="mb-1 w-1/2 gap-x-0.5" style={{ height: CARD_HEIGHT }}>
              <TrendingUserCard key={index} userRef={user} queryRef={query} />
            </View>
          ))}
        </View>
      );
    },
    [query, width]
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const slides = pages?.length ?? 0;
      const totalWidth = width * slides;
      const contentOffset = event.nativeEvent.contentOffset.x;
      const currentSlideIndex = Math.round((contentOffset / totalWidth) * slides);

      setCurrentSlideIndex(currentSlideIndex);
    },
    [pages?.length, width]
  );

  if (pages.length === 0) {
    return null;
  }

  return (
    <View className="flex flex-col space-y-3">
      <FlashList
        data={pages}
        renderItem={renderItem}
        estimatedItemSize={width}
        horizontal
        directionalLockEnabled
        pagingEnabled
        decelerationRate="fast"
        snapToAlignment="center"
        scrollEventThrottle={200}
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
      />

      {isPaginated && (
        <View className="flex w-full flex-row justify-center">
          <View className="flex flex-row space-x-1">
            {pages.map((_, index) => {
              return <Circle key={index} active={currentSlideIndex === index} />;
            })}
          </View>
        </View>
      )}
    </View>
  );
}

function Circle({ style, active }: { style?: StyleProp<ViewStyle>; active: boolean }) {
  return (
    <View
      className={`h-1 w-1 rounded-full ${
        active ? 'bg-black-800 dark:bg-white' : 'bg-porcelain dark:bg-shadow'
      }`}
      style={style}
    />
  );
}
