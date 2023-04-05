import clsx from 'clsx';
import { PropsWithChildren, useCallback } from 'react';
import { Linking, TouchableOpacity, TouchableOpacityProps } from 'react-native';

import { Typography } from './Typography';

type Props = PropsWithChildren<{
  href?: string;
  noUnderline?: boolean;
  onPress?: () => void;
  style?: TouchableOpacityProps['style'];
}>;

export function InteractiveLink({ href, style, onPress, noUnderline = false, children }: Props) {
  const handlePress = useCallback(() => {
    if (href) {
      Linking.openURL(href);
    } else if (onPress) {
      onPress();
    }
  }, [href, onPress]);

  return (
    <TouchableOpacity style={style} onPress={handlePress}>
      <Typography
        className={clsx(`text-shadow text-sm`, {
          underline: !noUnderline,
        })}
        font={{ family: 'ABCDiatype', weight: 'Regular' }}
      >
        {children}
      </Typography>
    </TouchableOpacity>
  );
}
