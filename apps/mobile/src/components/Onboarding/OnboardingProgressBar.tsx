import { useColorScheme } from 'nativewind';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions } from 'react-native';
import colors from 'shared/theme/colors';

type Props = {
  from: number;
  to: number;
};

export function OnboardingProgressBar({ from, to }: Props) {
  const initialWidth = Dimensions.get('window').width * (from / 100);

  const widthAnim = useRef(new Animated.Value(initialWidth)).current;
  const { colorScheme } = useColorScheme();

  useEffect(() => {
    // Calculate the final width in pixels based on the `to` prop.
    const finalWidth = Dimensions.get('window').width * (to / 100);

    Animated.timing(widthAnim, {
      toValue: finalWidth,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [to, widthAnim]);

  return (
    <Animated.View
      style={{
        height: 4,
        backgroundColor: colorScheme === 'dark' ? colors.darkModeBlue : colors.activeBlue,
        width: widthAnim,
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
        marginHorizontal: -16,
      }}
    />
  );
}
