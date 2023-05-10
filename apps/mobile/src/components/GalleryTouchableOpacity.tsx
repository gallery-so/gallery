import { useNavigationState } from '@react-navigation/native';
import { useCallback } from 'react';
import { GestureResponderEvent, TouchableOpacity, TouchableOpacityProps } from 'react-native';

import { useTrack } from '~/shared/contexts/AnalyticsContext';

export type GalleryTouchableOpacityProps = {
  // unique identifier for the element
  id?: string;
  eventName?: string;
  onPress?: (event: GestureResponderEvent) => void;
  properties?: Record<string, unknown>;
} & Omit<TouchableOpacityProps, 'onPress'>;

export function GalleryTouchableOpacity({
  children,
  eventName,
  id,
  onPress,
  properties,
  ...props
}: GalleryTouchableOpacityProps) {
  const track = useTrack();

  const currentScreen = useNavigationState((state) => {
    return state.routes[state.index]?.name;
  });

  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      const eventNameToUse = eventName || 'Button Press';

      // Only include id in the properties if it's provided
      const trackProperties = id
        ? { id, screen: currentScreen, ...properties }
        : { screen: currentScreen, ...properties };

      track(eventNameToUse, trackProperties);
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
