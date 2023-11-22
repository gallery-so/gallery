import { useCallback, useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { RefreshIcon } from 'src/icons/RefreshIcon';

import { IconContainer } from '~/components/IconContainer';
import { contexts } from '~/shared/analytics/constants';

type AnimatedRefreshIconProps = {
  onSync: () => void;
  onRefresh: () => void;
  isSyncing: boolean;
  eventElementId: string;
  eventName: string;
};

export function AnimatedRefreshIcon({
  onSync,
  onRefresh,
  isSyncing,
  eventElementId,
  eventName,
}: AnimatedRefreshIconProps) {
  const handleSync = useCallback(async () => {
    if (isSyncing) return;
    await onSync();
    onRefresh();
  }, [isSyncing, onRefresh, onSync]);

  const spinValue = useRef(new Animated.Value(0)).current;

  const spin = useCallback(() => {
    spinValue.setValue(0);
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(({ finished }) => {
      // Only repeat the animation if it completed (wasn't interrupted) and isSyncing is still true
      if (finished && isSyncing) {
        spin();
      }
    });
  }, [isSyncing, spinValue]);

  const spinAnimation = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  useEffect(() => {
    if (isSyncing) {
      spin();
    } else {
      spinValue.stopAnimation();
    }
  }, [isSyncing, spin, spinValue]);

  return (
    <IconContainer
      size="sm"
      onPress={handleSync}
      icon={
        <Animated.View style={{ transform: [{ rotate: spinAnimation }] }}>
          <RefreshIcon />
        </Animated.View>
      }
      eventElementId={eventElementId}
      eventName={eventName}
      eventContext={contexts.Posts}
    />
  );
}
