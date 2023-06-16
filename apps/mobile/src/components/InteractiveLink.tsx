import clsx from 'clsx';
import { PropsWithChildren, useCallback } from 'react';
import { Linking, TouchableOpacityProps } from 'react-native';

import { GalleryElementTrackingProps } from '~/shared/contexts/AnalyticsContext';

import { GalleryTouchableOpacity } from './GalleryTouchableOpacity';
import { Typography } from './Typography';

export type InteractiveLinkProps = PropsWithChildren<{
  href?: string;
  showUnderline?: boolean;
  onPress?: () => void;
  style?: TouchableOpacityProps['style'];
  // for tracking
  type: string | null;
  trackingProps?: GalleryElementTrackingProps['properties'];
}>;

export function InteractiveLink({
  href,
  style,
  onPress,
  showUnderline = false,
  children,
  type,
  trackingProps = {},
}: InteractiveLinkProps) {
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
      eventElementId="Interactive Link"
      eventName="Link Clicked"
      properties={{
        ...trackingProps,
        href: href ?? 'undefined',
        type: type ?? 'undefined',
      }}
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
