import clsx from 'clsx';
import { PropsWithChildren, useCallback } from 'react';
import { Linking, TouchableOpacity, TouchableOpacityProps } from 'react-native';

import { Typography } from './Typography';

type Props = PropsWithChildren<{
  href?: string;
  showUnderline?: boolean;
  onPress?: () => void;
  style?: TouchableOpacityProps['style'];
}>;

export function InteractiveLink({ href, style, onPress, showUnderline = false, children }: Props) {
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
        className={clsx(`text-shadow dark:text-white text-sm`, {
          underline: showUnderline,
        })}
        font={{ family: 'ABCDiatype', weight: 'Regular' }}
      >
        {children}
      </Typography>
    </TouchableOpacity>
  );
}
