import { PropsWithChildren } from 'react';
import { View, ViewProps } from 'react-native';

type Props = PropsWithChildren<{
  className?: string;
  style?: ViewProps['style'];
  active?: boolean;
}>;

export function Pill({ active = false, children, style }: Props) {
  return (
    <View
      style={style}
      className={`dark:border-shadow rounded-full border py-1 px-3 ${
        active ? 'border-black-800 dark:border-porcelain' : 'border-porcelain dark:border-metal'
      }`}
    >
      {children}
    </View>
  );
}
