import { useCallback } from 'react';
import { ViewProps } from 'react-native';
import { RefreshIcon } from 'src/icons/RefreshIcon';

import { IconContainer } from '~/components/IconContainer';
import { contexts } from '~/shared/analytics/constants';

type AnimatedRefreshIconProps = {
  onSync: () => void;
  isSyncing: boolean;
  eventElementId: string;
  eventName: string;
  style?: ViewProps['style'];
};

export function AnimatedRefreshIcon({
  onSync,
  isSyncing,
  eventElementId,
  eventName,
  style,
}: AnimatedRefreshIconProps) {
  const handleSync = useCallback(async () => {
    if (isSyncing) return;
    await onSync();
  }, [isSyncing, onSync]);

  return (
    <IconContainer
      size="sm"
      onPress={handleSync}
      icon={<RefreshIcon />}
      eventElementId={eventElementId}
      eventName={eventName}
      eventContext={contexts.Posts}
      disabled={isSyncing}
      style={[{ opacity: isSyncing ? 0.3 : 1 }, style]}
    />
  );
}
