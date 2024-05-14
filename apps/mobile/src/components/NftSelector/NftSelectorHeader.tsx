import { PropsWithChildren } from 'react';
import { View, ViewProps } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { BackButton } from '../BackButton';
import { Typography } from '../Typography';

type Props = {
  title: string;
  rightButton?: React.ReactNode;
  style?: ViewProps['style'];
} & PropsWithChildren;

export function NftSelectorHeader({ rightButton, title, children, style }: Props) {
  const animateStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(rightButton ? 1 : 0),
    };
  });

  return (
    <View style={style}>
      <View className="px-4 relative flex-row justify-between items-center">
        <BackButton />

        <View
          className="absolute inset-0 flex flex-row justify-center items-center"
          pointerEvents="none"
        >
          <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
            {title}
          </Typography>
        </View>
        <Animated.View style={animateStyle}>{rightButton && rightButton}</Animated.View>
      </View>

      {children}
    </View>
  );
}
