import { useCallback, useMemo, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleProp,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
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

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const { width } = useWindowDimensions();

  // Format the data into array of arrays of size PAGE_SIZE
  const pages = useMemo(() => {
    const pages = [];

    for (let i = 0; i < users.length; i += PAGE_SIZE) {
      pages.push(users.slice(i, i + PAGE_SIZE));
    }

    return pages;
  }, [users]);

  const isPaginated = pages.length > 1;

  const renderPage = useCallback(
    (cells: Array<TrendingUserCardFragment$key>) => {
      return (
        <View className="flex max-w-full flex-row flex-wrap justify-between">
          {cells.map((user, index) => (
            <View key={index} className="mb-1 w-[49%]">
              <TrendingUserCard key={index} userRef={user} queryRef={query} />
            </View>
          ))}
        </View>
      );
    },
    [query]
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

  return (
    <View className="flex flex-col space-y-3">
      <ScrollView
        horizontal
        directionalLockEnabled
        pagingEnabled
        decelerationRate="fast"
        snapToAlignment="center"
        scrollEventThrottle={200}
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
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
      className={`h-1 w-1 rounded-full ${active ? 'bg-offBlack' : 'bg-porcelain'}`}
      style={style}
    />
  );
}
