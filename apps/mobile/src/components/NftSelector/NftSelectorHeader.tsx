import { PropsWithChildren } from 'react';
import { View, ViewProps } from 'react-native';

import { BackButton } from '../BackButton';
import { Typography } from '../Typography';

type Props = {
  title: string;
  rightButton?: React.ReactNode;
  style?: ViewProps['style'];
} & PropsWithChildren;

export function NftSelectorHeader({ rightButton, title, children, style }: Props) {
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

        {rightButton && rightButton}
      </View>

      {children}
    </View>
  );
}
