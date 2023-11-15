import { useEffect } from 'react';

import { useSanityMaintenanceCheck } from './sanity';
import { useEffectOnAppForeground } from './useEffectOnAppForeground';

export function useSanityMaintenanceCheckMobile() {
  // NOTE: this is deprecated and should use shared/MaintenanceStatusContext instead
  const {
    fetchMaintenanceModeStatus,
    maintenanceCheckLoadedOrError,
    currentlyActiveMaintenanceNoticeContent,
  } = useSanityMaintenanceCheck();

  useEffect(
    // fetch on app load, runs only once
    function fetchMaintenanceModeOnAppLoad() {
      fetchMaintenanceModeStatus();
    },
    [fetchMaintenanceModeStatus]
  );

  useEffectOnAppForeground(fetchMaintenanceModeStatus);

  return {
    maintenanceCheckLoadedOrError,
    maintenanceModeResponse: currentlyActiveMaintenanceNoticeContent,
  };
}
