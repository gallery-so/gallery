import { FlashList } from '@shopify/flash-list';
import { useCallback } from 'react';
import { useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { trigger } from 'react-native-haptic-feedback';
import Animated, {
  AnimatedRef,
  Easing,
  runOnJS,
  scrollTo,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ListItemType } from '../GalleryEditorRenderer';
import { getOrder, getPosition, Positions } from './utils';

type Props = {
  children: React.ReactNode;
  id: string;
  positions: SharedValue<Positions>;
  animatedId: SharedValue<string | null>;
  size: number;
  columns: number;

  scrollContentOffsetY: SharedValue<number>;
  scrollViewRef: AnimatedRef<FlashList<ListItemType>>;

  onDragStart: () => void;
  onDragEnd: (data: string[]) => void;
};

export function SortableToken({
  children,
  columns,
  positions,
  animatedId,
  size,
  id,
  scrollContentOffsetY,
  scrollViewRef,
  onDragStart,
  onDragEnd,
}: Props) {
  const position = getPosition(positions.value[id] || 0, columns, size);

  // Shared values for gesture handling
  const contextX = useSharedValue(0);
  const contextY = useSharedValue(0);

  const translateX = useSharedValue(position.x);
  const translateY = useSharedValue(position.y);

  // Shared values for tracking gesture and animation state
  const wasLastActiveId = useSharedValue(false);

  // Animated reaction to update last active index
  useAnimatedReaction(
    () => animatedId.value,
    (currentActiveId) => {
      if (currentActiveId) {
        wasLastActiveId.value = currentActiveId === id;
      }
    }
  );

  // Derived value to check if the gesture is active
  const isGestureActive = useDerivedValue(() => {
    return animatedId.value === id;
  }, [id]);

  // Get safe area insets and window dimensions
  const inset = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const containerHeight = windowHeight - inset.top;

  useAnimatedReaction(
    () => positions.value[id],
    (newOrder) => {
      // if (!newOrder) return;
      const newPosition = getPosition(newOrder || 0, columns, size);
      translateX.value = withTiming(newPosition.x, {
        duration: 350,
        easing: Easing.inOut(Easing.ease),
      });
      translateY.value = withTiming(newPosition.y, {
        duration: 350,
        easing: Easing.inOut(Easing.ease),
      });
    }
  );

  // Callback to handle edge cases while scrolling
  // (when the user drags the item to the top or bottom of the list)
  // Since we need to update the scroll position of the scroll view (scrollTo)
  const scrollLogic = useCallback(
    ({ absoluteY }: { absoluteY: number }) => {
      'worklet';

      const lowerBound = 1.5 * size;
      const upperBound = scrollContentOffsetY.value + containerHeight;
      const scrollSpeed = size * 0.1;

      if (absoluteY <= lowerBound) {
        // while scrolling to the top of the list
        const nextPosition = scrollContentOffsetY.value - scrollSpeed;
        scrollTo(scrollViewRef, 0, Math.max(nextPosition, 0), false);
      } else if (absoluteY + scrollContentOffsetY.value >= upperBound) {
        // while scrolling to the bottom of the list
        const nextPosition = scrollContentOffsetY.value + scrollSpeed;
        scrollTo(scrollViewRef, 0, Math.max(nextPosition, 0), false);
      }
    },
    [containerHeight, scrollContentOffsetY, scrollViewRef, size]
  );

  // Need to keep track of the previous positions to check if the positions have changed
  // This is needed to trigger the onDragEnd callback
  // const prevPositions = useSharedValue({});
  const prevPositions = useSharedValue({} as Record<string, number>);

  const panGesture = Gesture.Pan()
    .activateAfterLongPress(300)
    .onStart(() => {
      // Store the previous positions (before the gesture starts)
      prevPositions.value = Object.assign({}, positions.value);

      animatedId.value = id;

      contextX.value = translateX.value;
      contextY.value = translateY.value - scrollContentOffsetY.value;

      runOnJS(trigger)('impactLight');

      runOnJS(onDragStart)();
    })
    .onUpdate((event) => {
      const { translationX, translationY, absoluteY } = event;

      translateX.value = contextX.value + translationX;
      translateY.value = contextY.value + translationY + scrollContentOffsetY.value;

      const oldOrder = positions.value[id];
      const newOrder = getOrder(translateX.value, translateY.value, columns, size);

      if (oldOrder !== newOrder) {
        const idToSwap = Object.keys(positions.value).find(
          (key) => positions.value[key] === newOrder
        );

        if (idToSwap) {
          const newPositions = JSON.parse(JSON.stringify(positions.value));
          newPositions[id] = newOrder;
          newPositions[idToSwap] = oldOrder;
          positions.value = newPositions;
        }
      }

      scrollLogic({ absoluteY });
    })
    .onFinalize(() => {
      const newPosition = getPosition(positions.value[id]! || 0, columns, size);

      translateX.value = withTiming(newPosition.x, {
        easing: Easing.inOut(Easing.ease),
        duration: 350,
      });

      translateY.value = withTiming(
        newPosition.y,
        {
          easing: Easing.inOut(Easing.ease),
          duration: 350,
        },
        (isFinished) => {
          // Check if the positions have changed to trigger the onDragEnd callback
          const positionsHaveChanged = Object.keys(prevPositions.value).some((key) => {
            return positions.value[key] !== prevPositions.value[key];
          });

          if (isFinished && onDragEnd && positionsHaveChanged) {
            const sortedIds = Object.keys(positions.value).sort((a, b) => {
              const prev = positions.value[a] || 0;
              const next = positions.value[b] || 0;

              return prev - next;
            });

            runOnJS(onDragEnd)(sortedIds);
          }

          // Reset the animated id
          animatedId.value = null;
        }
      );
    });

  const style = useAnimatedStyle(() => {
    const zIndex = isGestureActive.value ? 100 : 0;
    const scale = isGestureActive.value ? 1.05 : 1;

    return {
      position: 'absolute',
      top: 0,
      left: 0,
      width: size,
      height: size,
      zIndex,
      transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { scale }],
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={style}>{children}</Animated.View>
    </GestureDetector>
  );
}
