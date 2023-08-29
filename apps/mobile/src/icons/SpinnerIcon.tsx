import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Path, SvgProps } from 'react-native-svg';

type Props = {
  spin?: boolean;
} & SvgProps;

export function SpinnerIcon({ spin, ...props }: Props) {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (spin) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [spin, spinValue]);

  const spinAnimation = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '720deg'],
  });

  return (
    <Animated.View
      style={{
        transform: [{ rotate: spin ? spinAnimation : '0deg' }],
        width: 118,
        height: 118,
      }}
    >
      <Svg width={118} height={118} fill="none" {...props}>
        <Path fill="#fff" d="M.966 99.345 18.897.966l98.38 17.931-17.932 98.38z" />
        <Path
          fill="#000"
          fillRule="evenodd"
          d="M82.067 76.384a23.696 23.696 0 0 0-21.352-40.649l1.428 2.72a20.734 20.734 0 0 1 18.496 35.21l1.428 2.719Z"
          clipRule="evenodd"
        />
      </Svg>
    </Animated.View>
  );
}