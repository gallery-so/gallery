import { useCallback } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { ItemHeights, Positions } from './SortableRowList';

type Props = {
  children: React.ReactNode;
  index: number;
  positions: SharedValue<Positions>;
  animatedIndex: SharedValue<number | null>;
  itemHeights: SharedValue<ItemHeights>;

  onDragEnd: (data: string[]) => void;
};

export function SortableRow({
  children,
  index,
  positions,
  animatedIndex,
  itemHeights,
  onDragEnd,
}: Props) {
  const itemHeight = itemHeights.value[index] ?? 0;
  // Shared values for gesture handling
  const contextY = useSharedValue(0);
  const translateX = useSharedValue(0);

  // Shared values for tracking gesture and animation state
  const wasLastActiveIndex = useSharedValue(false);

  // Animated reaction to update last active index
  useAnimatedReaction(
    () => animatedIndex.value,
    (currentActiveIndex) => {
      if (currentActiveIndex) {
        wasLastActiveIndex.value = currentActiveIndex === index;
      }
    }
  );

  // Derived value to check if the gesture is active
  const isGestureActive = useDerivedValue(() => {
    return animatedIndex.value === index;
  }, [index]);

  // Callback to get the position of a list item
  const getPosition = useCallback(
    (itemIndex: number) => {
      'worklet';

      let sum = 0;

      const positionsValue: Positions = positions.value;
      const itemHeightsValue: ItemHeights = itemHeights.value;

      if (Object.values(positions.value).length === 0) {
        return 0;
      }

      const sortedPositions = Object.keys(positionsValue).sort((a, b) => {
        const prev = positions.value[Number(a)] ?? 0;
        const next = positions.value[Number(b)] ?? 0;

        return prev - next;
      });

      // sum of the height i-1
      for (let i = 0; i < sortedPositions.length; i++) {
        const index = Number(sortedPositions[i]);
        if (index === itemIndex) {
          break;
        }

        const height = itemHeightsValue[index] ?? 0;

        sum += height;
      }

      return sum;
    },
    [positions, itemHeights]
  );

  // Need to keep track of the previous positions to check if the positions have changed
  // This is needed to trigger the onDragEnd callback
  const prevPositions = useSharedValue({});

  const panGesture = Gesture.Pan()
    .activateAfterLongPress(300)
    .onStart((event) => {
      // Store the previous positions (before the gesture starts)
      prevPositions.value = Object.assign({}, positions.value);

      animatedIndex.value = index;

      contextY.value = positions.value[index] ?? 0;

      translateX.value = event.translationX;
    })
    .onUpdate((event) => {
      const { translationY } = event;

      const translateY = contextY.value + translationY;

      for (let i = 0; i < Object.keys(positions.value).length; i++) {
        // Check if the translateY is in range of another item
        const position = positions.value[i] ?? 0;
        const height = itemHeights.value[i] ?? 0;

        if (index === i) continue;

        if (translateY < position + height) {
          // Assign the new position to the active index
          positions.value[index] = translateY;
          break;
        }
      }

      positions.value = Object.assign({}, positions.value);
    })
    .onFinalize(() => {
      // set the exact position to active index
      positions.value[index] = getPosition(index);
      positions.value = Object.assign({}, positions.value);

      translateX.value = withTiming(0, undefined, (isFinished) => {
        // Check if the positions have changed to trigger the onDragEnd callback
        const positionsHaveChanged = Object.entries(prevPositions.value).some(([key, value]) => {
          return positions.value[Number(key)] !== value;
        });
        if (isFinished && onDragEnd && positionsHaveChanged) {
          const sortedByPositions = Object.values(positions.value).sort((a, b) => a - b);

          // get the sorted by index for the callback
          const sortedByIndex = sortedByPositions.map((position) => {
            return Object.keys(positions.value).find(
              (key) => positions.value[Number(key)] === position
            );
          });

          // typescript doesn't like the find method
          runOnJS(onDragEnd)(sortedByIndex.filter((item): item is string => Boolean(item)));
        }
      });

      wasLastActiveIndex.value = true;

      // Reset the animated index
      animatedIndex.value = null;
    });

  const translateY = useDerivedValue(() => {
    if (isGestureActive.value) return positions.value[index];

    const nextPosition = getPosition(index);

    positions.value[index] = nextPosition;
    positions.value = Object.assign({}, positions.value);

    return withTiming(nextPosition, {
      duration: 200,
    });
  }, [itemHeight, index]);

  // Callback to get the zIndex of the item
  const getZIndex = useCallback(() => {
    'worklet';
    // If it's the active item, it should be on top of the other items
    if (isGestureActive.value) return 100;

    // After we have released the item, we want to keep it on top of the other items
    // until the animation is finished.
    // This is needed to avoid flickering of the item while the animation is running :)
    if (wasLastActiveIndex.value) return 50;

    return 0;
  }, [isGestureActive.value, wasLastActiveIndex.value]);

  const rStyle = useAnimatedStyle(() => {
    const zIndex = getZIndex();

    return {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: zIndex,
      transform: [
        { translateY: translateY.value ?? 0 },
        {
          scale: withSpring(isGestureActive.value ? 1.05 : 1),
        },
      ],
    };
  }, []);

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          rStyle,
          {
            height: itemHeight,
          },
        ]}
      >
        {children}
      </Animated.View>
    </GestureDetector>
  );
}
