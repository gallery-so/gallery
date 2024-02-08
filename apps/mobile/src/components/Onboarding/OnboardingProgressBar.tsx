import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions } from 'react-native';
import colors from 'shared/theme/colors';

type Props = {
  from: number;
  to: number;
};

export function OnboardingProgressBar({ from, to }: Props) {
  const widthAnim = useRef(new Animated.Value(from / 100)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: Dimensions.get('window').width * (to / 100),
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [to, widthAnim]);

  return (
    <Animated.View
      style={{
        height: 4,
        width: widthAnim,
        backgroundColor: colors.activeBlue,
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
        marginHorizontal: -16,
      }}
    />
  );
}
