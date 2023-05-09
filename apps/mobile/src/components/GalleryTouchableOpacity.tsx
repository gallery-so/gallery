import { useNavigationState } from '@react-navigation/native';
import { useCallback } from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';

import { useTrack } from '~/shared/contexts/AnalyticsContext';

type Props = {
  // unique identifier for the element
  id: string;
  onPress?: () => void;
  properties?: Record<string, unknown>;
} & Omit<TouchableOpacityProps, 'onPress'>;

export function GalleryTouchableOpacity({ children, id, onPress, ...props }: Props) {
  const track = useTrack();

  const currentScreen = useNavigationState((state) => {
    return state.routes[state.index]?.name;
  });

  const handlePress = useCallback(() => {
    track('Button Press', {
      id,
      screen: currentScreen,
      ...props.properties,
    });
    if (onPress) {
      onPress();
    }
  }, [currentScreen, id, onPress, track]);

  return (
    <TouchableOpacity {...props} onPress={handlePress}>
      {children}
    </TouchableOpacity>
  );
}
