import clsx from 'clsx';
import { PropsWithChildren, useCallback } from 'react';
import { Linking, TouchableOpacityProps } from 'react-native';

import { GalleryTouchableOpacity } from './GalleryTouchableOpacity';
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
    <GalleryTouchableOpacity
      style={style}
      onPress={handlePress}
      id="Interactive Link"
      eventName="Link Clicked"
      properties={{ href: href ?? 'undefined' }}
    >
      <Typography
        className={clsx(`text-shadow dark:text-white text-sm`, {
          underline: showUnderline,
        })}
        font={{ family: 'ABCDiatype', weight: 'Regular' }}
      >
        {children}
      </Typography>
    </GalleryTouchableOpacity>
  );
}
