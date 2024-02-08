import { useCallback, useEffect, useMemo, useState } from 'react';
import { Animated, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { XMarkIcon } from 'src/icons/XMarkIcon';

import { contexts } from '~/shared/analytics/constants';
import { noop } from '~/shared/utils/noop';

import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';
import { Typography } from '../Typography';
import {
  ANIMATED_COMPONENT_TIMEOUT_MS,
  ANIMATED_COMPONENT_TRANSITION_MS,
  ANIMATED_COMPONENT_TRANSLATION_PIXELS_SMALL,
} from './transition';

export type ToastPosition = 'top' | 'bottom';

type Props = {
  message?: string;
  onClose?: () => void;
  autoClose?: boolean;
  children?: JSX.Element;
  withoutNavbar?: boolean;
  position?: ToastPosition;
};

export function AnimatedToast({
  message,
  onClose = noop,
  autoClose = true,
  children,
  withoutNavbar,
  position = 'bottom',
}: Props) {
  const animationValue = useState(new Animated.Value(0))[0];

  const { bottom, top } = useSafeAreaInsets();

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

  const positionStyles = useMemo(() => {
    if (position === 'top') {
      return { top: top };
    }

    // 56 is the height of the bottom navigation bar
    return { bottom: bottom + (withoutNavbar ? 0 : 56) };
  }, [bottom, position, top, withoutNavbar]);

  return (
    <Animated.View
      className="absolute inset-x-0 z-50 justify-center items-center max-w-full"
      style={[positionStyles, animatedStyles]}
    >
      <View className="flex-row items-center p-2 space-x-2 bg-offWhite dark:bg-black-800 border border-black-800 dark:border-porcelain max-w-full">
        {message && (
          <Typography
            className="text-sm text-offBlack dark:text-offWhite"
            font={{ family: 'ABCDiatype', weight: 'Regular' }}
          >
            {message}
          </Typography>
        )}

        {children && children}

        <GalleryTouchableOpacity
          onPress={handleClose}
          eventElementId="Toast"
          eventName="Toast closed clicked"
          eventContext={contexts.Toast}
        >
          <XMarkIcon />
        </GalleryTouchableOpacity>
      </View>
    </Animated.View>
  );
}
