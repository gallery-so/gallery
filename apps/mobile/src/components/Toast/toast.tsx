import { useCallback, useEffect, useState } from 'react';
import { Animated, StyleSheet,View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { XMarkIcon } from 'src/icons/XMarkIcon';

import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';
import { Markdown } from '../Markdown';
import {
  ANIMATED_COMPONENT_TIMEOUT_MS,
  ANIMATED_COMPONENT_TRANSITION_MS,
  ANIMATED_COMPONENT_TRANSLATION_PIXELS_SMALL,
} from './transition';

type Props = {
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
};

const markdownStyles = StyleSheet.create({
  paragraph: {
    marginBottom: 0,
  },
});

export function AnimatedToast({ message, onClose = () => {}, autoClose = true }: Props) {
  const animationValue = useState(new Animated.Value(0))[0];

  const { bottom } = useSafeAreaInsets();

  useEffect(() => {
    Animated.timing(animationValue, {
      toValue: 1,
      duration: ANIMATED_COMPONENT_TRANSITION_MS,
      useNativeDriver: true,
    }).start();

    if (autoClose) {
      const timeoutId = setTimeout(() => {
        Animated.timing(animationValue, {
          toValue: 0,
          duration: ANIMATED_COMPONENT_TRANSITION_MS,
          useNativeDriver: true,
        }).start(() => onClose());
      }, ANIMATED_COMPONENT_TIMEOUT_MS);

      return () => clearTimeout(timeoutId);
    }
  }, [autoClose, onClose, animationValue]);

  const handleClose = useCallback(() => {
    Animated.timing(animationValue, {
      toValue: 0,
      duration: ANIMATED_COMPONENT_TRANSITION_MS,
      useNativeDriver: true,
    }).start(onClose);
  }, [onClose, animationValue]);

  const translateY = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [ANIMATED_COMPONENT_TRANSLATION_PIXELS_SMALL, 0],
  });

  const animatedStyles = {
    opacity: animationValue,
    transform: [{ translateY }],
  };

  return (
    <Animated.View
      className="absolute inset-x-0 z-50 justify-center items-center"
      style={[
        {
          // 56 is the height of the bottom navigation bar
          bottom: bottom + 56,
        },
        animatedStyles,
      ]}
    >
      <View className="flex-row items-center p-2 space-x-2 bg-white border">
        <Markdown style={markdownStyles}>{message}</Markdown>

        <GalleryTouchableOpacity onPress={handleClose} eventElementId={null} eventName={null}>
          <XMarkIcon />
        </GalleryTouchableOpacity>
      </View>
    </Animated.View>
  );
}
