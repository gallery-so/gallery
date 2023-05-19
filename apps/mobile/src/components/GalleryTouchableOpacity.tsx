import { useNavigationState } from '@react-navigation/native';
import { useCallback } from 'react';
// eslint-disable-next-line no-restricted-imports
import { GestureResponderEvent, TouchableOpacity, TouchableOpacityProps } from 'react-native';

import { GalleryElementTrackingProps, useTrack } from '~/shared/contexts/AnalyticsContext';

export type GalleryTouchableOpacityProps = GalleryElementTrackingProps & TouchableOpacityProps;

export function GalleryTouchableOpacity({
  children,
  id,
  eventName,
  onPress,
  properties,
  ...props
}: GalleryTouchableOpacityProps) {
  const track = useTrack();

  const currentScreen = useNavigationState((state) => {
    return state?.routes[state.index]?.name;
  });

  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      if (id) {
        track('Button Press', {
          id,
          name: eventName,
          screen: currentScreen,
          ...properties,
        });
      }

      if (onPress) {
        onPress(event);
      }
    },
    [currentScreen, eventName, id, onPress, properties, track]
  );

  return (
    <TouchableOpacity {...props} onPress={handlePress}>
      {children}
    </TouchableOpacity>
  );
}
