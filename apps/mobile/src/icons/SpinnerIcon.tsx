import { useColorScheme } from 'nativewind';
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Path, SvgProps } from 'react-native-svg';

import colors from '~/shared/theme/colors';

type Props = {
  spin?: boolean;
} & SvgProps;

export function SpinnerIcon({ spin, ...props }: Props) {
  const { colorScheme } = useColorScheme();

  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (spin) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 5000,
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

  const styles = useMemo(() => {
    if (colorScheme === 'dark') {
      return {
        spinner: colors.white,
      };
    }

    return {
      spinner: colors.black[900],
    };
  }, [colorScheme]);

  return (
    <Animated.View
      style={{
        transform: [{ rotate: spin ? spinAnimation : '0deg' }],
        width: 101,
      }}
    >
      <Svg width={101} height={101} fill="none" {...props}>
        <Path
          fill={styles.spinner}
          fillRule="evenodd"
          d="m74.825 28.93.103-.069a33.18 33.18 0 0 0-.605-.668l.502.737Zm-2.769-2.951a32.638 32.638 0 0 0-17.312-7.938 32.06 32.06 0 0 0-22.156 5.156A32.053 32.053 0 0 0 19.457 41.77a32.628 32.628 0 0 0 .95 19.376l3.454-2.353a28.54 28.54 0 0 1-.49-15.965 28.046 28.046 0 0 1 11.49-16.252 28.052 28.052 0 0 1 19.386-4.511 28.545 28.545 0 0 1 14.354 6.266l3.455-2.352Z"
          clipRule="evenodd"
        />
      </Svg>
    </Animated.View>
  );
}
