import { useNavigationState } from '@react-navigation/native';
import { useCallback } from 'react';
import {
  GestureResponderEvent,
  // eslint-disable-next-line no-restricted-imports
  TouchableOpacity,
  TouchableOpacityProps,
  // eslint-disable-next-line no-restricted-imports
  TouchableWithoutFeedback,
} from 'react-native';

import { GalleryElementTrackingProps, useTrack } from '~/shared/contexts/AnalyticsContext';

export type GalleryTouchableOpacityProps = {
  withoutFeedback?: boolean;
} & GalleryElementTrackingProps &
  TouchableOpacityProps;

export function GalleryTouchableOpacity({
  children,
  eventElementId,
  eventName,
  eventContext,
  eventFlow,
  onPress,
  properties,
  withoutFeedback,
  ...props
}: GalleryTouchableOpacityProps) {
  const track = useTrack();

  const currentScreen = useNavigationState((state) => {
    return state?.routes[state.index]?.name;
  });

  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      if (eventElementId) {
        track('Button Press', {
          id: eventElementId,
          name: eventName,
          context: eventContext,
          flow: eventFlow,
          screen: currentScreen,
          ...properties,
        });
      }

      if (onPress) {
        onPress(event);
      }
    },
    [currentScreen, eventContext, eventElementId, eventFlow, eventName, onPress, properties, track]
  );

  if (withoutFeedback) {
    return (
      <TouchableWithoutFeedback {...props} onPress={handlePress}>
        {children}
      </TouchableWithoutFeedback>
    );
  }

  return (
    <TouchableOpacity {...props} onPress={handlePress}>
      {children}
    </TouchableOpacity>
  );
}
