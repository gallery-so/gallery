import { useCallback } from 'react';
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

  return (
    <IconContainer
      size="sm"
      onPress={handleSync}
      icon={<RefreshIcon />}
      eventElementId={eventElementId}
      eventName={eventName}
      eventContext={contexts.Posts}
      style={{ opacity: isSyncing ? 0.3 : 1 }}
    />
  );
}
