import clsx from 'clsx';
import { PropsWithChildren, useCallback } from 'react';
import { Linking, TextProps, TouchableOpacityProps } from 'react-native';

import { GalleryElementTrackingProps } from '~/shared/contexts/AnalyticsContext';

import { GalleryTouchableOpacity } from './GalleryTouchableOpacity';
import { Typography, TypographyProps } from './Typography';

export type InteractiveLinkProps = PropsWithChildren<{
  href?: string;
  showUnderline?: boolean;
  isSecondary?: boolean; // if true, the text color renders as normal Typography..
  onPress?: () => void;
  style?: TouchableOpacityProps['style'];
  // for tracking
  type: string | null;
  textStyle?: TextProps['style'];
  font?: TypographyProps['font'];
  trackingProps?: GalleryElementTrackingProps['properties'];
}>;

export function InteractiveLink({
  href,
  style,
  onPress,
  showUnderline = false,
  isSecondary = false,
  children,
  type,
  textStyle,
  font,
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
        className={clsx(`text-sm`, {
          'text-shadow dark:text-white': !isSecondary,
          underline: showUnderline,
        })}
        style={[textStyle, { lineHeight: undefined }]}
        font={font ?? { family: 'ABCDiatype', weight: 'Regular' }}
      >
        {children}
      </Typography>
    </GalleryTouchableOpacity>
  );
}
