/**
 * The goal of this component is to ensure that on phones with or without a notch,
 * the content has some space from the top and bottom of the screen.
 */

import { PropsWithChildren } from 'react';
import { View, ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function useSafeAreaPadding() {
  const insets = useSafeAreaInsets();

  return {
    top: insets.top ? insets.top + 8 : 16,
    bottom: insets.bottom ? insets.bottom + 8 : 16,
    left: insets.left,
    right: insets.right,
  };
}

type Props = PropsWithChildren<{
  className?: string;
  style?: ViewProps['style'];
}>;

export function SafeAreaViewWithPadding({ style, children }: Props) {
  const { top, bottom, left, right } = useSafeAreaPadding();

  return (
    <View
      style={[
        style,
        { paddingBottom: bottom, paddingTop: top, paddingLeft: left, paddingRight: right },
      ]}
    >
      {children}
    </View>
  );
}
