import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useGalleryDraggableActions } from '~/contexts/GalleryEditor/GalleryDraggableContext';

export type DragItem = {
  id: string;
  type: 'section' | 'row';
};

type Props = {
  value: DragItem;
  children: React.ReactNode;
  disabled?: boolean;
};

export function Draggable({ value, children, disabled }: Props) {
  const { setIsDragging, onGestureUpdate, onLayoutUpdates } = useGalleryDraggableActions();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const initialX = useSharedValue(0);
  const initialY = useSharedValue(0);

  const isGestureActive = useSharedValue(false);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      initialX.value = translateX.value;
      initialY.value = translateY.value;
      isGestureActive.value = true;
      runOnJS(setIsDragging)(true);
      //   console.log(`start dragging ${value.id} of type ${value.type}...`);
    })
    .onUpdate((event) => {
      translateX.value = initialX.value + event.translationX;
      translateY.value = initialY.value + event.translationY;
    })
    .onEnd((event) => {
      runOnJS(onGestureUpdate)(value, { x: event.absoluteX, y: event.absoluteY });

      translateX.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(0, { duration: 200 }, () => {
        isGestureActive.value = false;
        runOnJS(setIsDragging)(false);
      });
    })
    .activateAfterLongPress(300)
    .enabled(!disabled);

  const animatedStyle = useAnimatedStyle(() => {
    const zIndex = isGestureActive.value ? 100 : 0;
    return {
      zIndex,
      transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
    };
  });

  return (
    <Animated.View
      style={animatedStyle}
      onLayout={(e) => {
        const { x, y, width, height } = e.nativeEvent.layout;
        // console.log(`layout updated for ${value.id} of type ${value.type}...`);
        onLayoutUpdates({ x, y, width, height, id: value.id, type: value.type });
      }}
    >
      <GestureDetector gesture={panGesture}>{children}</GestureDetector>
    </Animated.View>
  );
}
