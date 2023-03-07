import { FlashList, ListRenderItem } from '@shopify/flash-list';
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
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { TokenCarouselFragment$key } from '~/generated/TokenCarouselFragment.graphql';

import { EventTokenGrid } from './EventTokenGrid';

type TokenCarouselProps = {
  tokenRefs: TokenCarouselFragment$key;
};

export function TokenCarousel({ tokenRefs }: TokenCarouselProps) {
  const tokens = useFragment(
    graphql`
      fragment TokenCarouselFragment on Token @relay(plural: true) {
        __typename

        ...EventTokenGridFragment
      }
    `,
    tokenRefs
  );

  const { width } = useWindowDimensions();

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const chunks = useMemo(() => {
    const chunks = [];
    const tokensPerPage = 4;
    const maxTokens = tokensPerPage * 8;
    for (let i = 0; i < Math.min(maxTokens, tokens.length); i += 4) {
      chunks.push(tokens.slice(i, i + 4));
    }
    return chunks;
  }, [tokens]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const slides = chunks?.length ?? 0;
      const totalWidth = width * slides;
      const contentOffset = event.nativeEvent.contentOffset.x;
      const currentSlideIndex = Math.round((contentOffset / totalWidth) * slides);

      setCurrentSlideIndex(currentSlideIndex);
    },
    [chunks?.length, width]
  );

  const renderItem = useCallback<ListRenderItem<(typeof chunks)[number]>>(({ item }) => {
    return <EventTokenGrid tokenRefs={item} />;
  }, []);

  return (
    <View className="flex flex-col space-y-3">
      <FlashList
        horizontal
        data={chunks}
        pagingEnabled
        snapToInterval={width}
        renderItem={renderItem}
        decelerationRate="fast"
        snapToAlignment="center"
        estimatedItemSize={width}
        showsHorizontalScrollIndicator={false}
      />

      {chunks?.length > 1 && (
        <View className="flex w-full flex-row justify-center py-3">
          <View className="flex flex-row space-x-1">
            {chunks.map((_, index) => {
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
