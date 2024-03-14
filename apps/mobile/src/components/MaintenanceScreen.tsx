import { View } from 'react-native';
import { useMaintenanceContext } from 'shared/contexts/MaintenanceStatusContext';
import { useEffectOnAppForeground } from 'src/utils/useEffectOnAppForeground';

import { Typography } from './Typography';

export function MaintenanceScreen() {
  const { currentlyActiveMaintenanceNoticeContent } = useMaintenanceContext();

  return (
    <View className="flex-1 bg-white dark:bg-black-900 flex justify-center items-center p-6">
      <Typography className="text-l mb-1" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
        Maintenance in Progress
      </Typography>
      <Typography
        className="text-l text-center leading-6"
        font={{ family: 'ABCDiatype', weight: 'Regular' }}
      >
        {currentlyActiveMaintenanceNoticeContent?.message}
      </Typography>
    </View>
  );
}

export function CheckMaintenanceOnAppForeground() {
  const { fetchMaintenanceModeStatus } = useMaintenanceContext();

  useEffectOnAppForeground(fetchMaintenanceModeStatus);

  return <></>;
}
