import { PropsWithChildren } from 'react';
import { View, ViewProps } from 'react-native';

import { Typography } from '../../components/Typography';

export function DetailSection({
  children,
  style,
}: PropsWithChildren<{ style?: ViewProps['style'] }>) {
  return (
    <View style={style} className="flex flex-1 flex-col items-start">
      {children}
    </View>
  );
}

export function DetailLabelText({ children }: PropsWithChildren) {
  return (
    <Typography className="text-xs dark:color-metal" font={{ family: 'ABCDiatype', weight: 'Medium' }}>
      {children}
    </Typography>
  );
}

export function DetailValue({ children }: PropsWithChildren) {
  return (
    <Typography
      numberOfLines={1}
      ellipsizeMode="middle"
      className="text-sm"
      font={{ family: 'ABCDiatype', weight: 'Regular' }}
    >
      {children}
    </Typography>
  );
}
