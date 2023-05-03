import { PropsWithChildren } from 'react';
import { View, ViewProps } from 'react-native';

type Props = PropsWithChildren<{ className?: string; style?: ViewProps['style'] }>;

export function Pill({ children, style }: Props) {
  return (
    <View
      style={style}
      className="border-porcelain dark:border-shadow rounded-full border py-1 px-3"
    >
      {children}
    </View>
  );
}
