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

import { GalleryUpdatedFeedEventFragment$key } from '~/generated/GalleryUpdatedFeedEventFragment.graphql';

import { SUPPORTED_FEED_EVENT_TYPES } from '../constants';
import { NonRecursiveFeedListItem } from './NonRecursiveFeedListItem';

type GalleryUpdatedFeedEventProps = {
  eventId: string;
  eventDataRef: GalleryUpdatedFeedEventFragment$key;
};

export function GalleryUpdatedFeedEvent({ eventDataRef, eventId }: GalleryUpdatedFeedEventProps) {
  const eventData = useFragment(
    graphql`
      fragment GalleryUpdatedFeedEventFragment on GalleryUpdatedFeedEventData {
        subEventDatas @required(action: THROW) {
          __typename
          ...NonRecursiveFeedListItemFragment
        }
      }
    `,
    eventDataRef
  );

  const subEvents = useMemo(() => {
    return eventData.subEventDatas
      .filter((subEvent) => {
        return SUPPORTED_FEED_EVENT_TYPES.has(subEvent.__typename);
      })
      .slice(0, 4);
  }, [eventData.subEventDatas]);

  const { width } = useWindowDimensions();

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const slides = subEvents?.length ?? 0;
      const totalWidth = width * slides;
      const contentOffset = event.nativeEvent.contentOffset.x;
      const currentSlideIndex = Math.round((contentOffset / totalWidth) * slides);

      setCurrentSlideIndex(currentSlideIndex);
    },
    [subEvents?.length, width]
  );

  const isPaginated = subEvents.length > 1;

  return (
    <View className="flex flex-col space-y-3">
      <ScrollView
        horizontal
        directionalLockEnabled
        pagingEnabled
        snapToInterval={width}
        onScroll={handleScroll}
        decelerationRate="fast"
        snapToAlignment="center"
        scrollEventThrottle={200}
        scrollEnabled={isPaginated}
        showsHorizontalScrollIndicator={false}
      >
        {subEvents.map((subEvent, index) => {
          return (
            <NonRecursiveFeedListItem
              key={index}
              eventId={eventId}
              slideIndex={index}
              eventCount={subEvents.length}
              eventDataRef={subEvent}
            />
          );
        })}
      </ScrollView>

      {isPaginated && (
        <View className="flex w-full flex-row justify-center">
          <View className="flex flex-row space-x-1">
            {subEvents.map((_, index) => {
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
