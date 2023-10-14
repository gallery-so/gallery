import { useNavigationState } from '@react-navigation/native';
import clsx from 'clsx';
import { PropsWithChildren, useCallback } from 'react';
import { GestureResponderEvent, Linking, TextProps, TouchableOpacityProps } from 'react-native';

import { GalleryElementTrackingProps, useTrack } from '~/shared/contexts/AnalyticsContext';

import { GalleryTouchableOpacity } from './GalleryTouchableOpacity';
import { Typography, TypographyProps } from './Typography';

export type GalleryLinkProps = PropsWithChildren<{
  href?: string;
  showUnderline?: boolean;
  onPress?: () => void;
  style?: TouchableOpacityProps['style'];
  textStyle?: TextProps['style'];
  font?: TypographyProps['font'];
}> &
  GalleryElementTrackingProps &
  TouchableOpacityProps;

export function GalleryLink({
  href,
  style,
  onPress,
  showUnderline = false,
  children,
  textStyle,
  font,
  eventElementId,
  eventName,
  eventContext,
  eventFlow,
  properties = {},
}: GalleryLinkProps) {
  const _handlePress = useCallback(
    (event: GestureResponderEvent) => {
      if (href) {
        Linking.openURL(href);
      } else if (onPress) {
        onPress(event);
      }
    },
    [href, onPress]
  );

  const track = useTrack();

  const currentScreen = useNavigationState((state) => {
    return state?.routes[state.index]?.name;
  });

  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      if (eventElementId) {
        track('Interactive Link Press', {
          id: eventElementId,
          name: eventName,
          context: eventContext,
          flow: eventFlow,
          screen: currentScreen,
          ...properties,
        });
      }

      _handlePress(event);
    },
    [
      _handlePress,
      currentScreen,
      eventContext,
      eventElementId,
      eventFlow,
      eventName,
      properties,
      track,
    ]
  );

  return (
    <GalleryTouchableOpacity
      style={style}
      onPress={handlePress}
      // we track within this component, so no need to pass down
      // to GalleryTouchableOpacity
      eventElementId={null}
      eventName={null}
      eventContext={null}
    >
      <Typography
        className={clsx(`text-shadow dark:text-white text-sm`, {
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
