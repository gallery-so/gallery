import { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

import { useSanityMaintenanceCheck } from './sanity';

export function useSanityMaintenanceCheckMobile() {
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

  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(
    function fetchMaintenanceModeOnAppForeground() {
      const handleAppStateChange = (nextAppState: AppStateStatus) => {
        if ((appState === 'inactive' || appState === 'background') && nextAppState === 'active') {
          // app has come into the foreground
          fetchMaintenanceModeStatus();
        }
        setAppState(nextAppState);
      };
      const listener = AppState.addEventListener('change', handleAppStateChange);
      return () => {
        listener.remove();
      };
    },
    [appState, fetchMaintenanceModeStatus]
  );

  return {
    maintenanceCheckLoadedOrError,
    maintenanceModeResponse: currentlyActiveMaintenanceNoticeContent,
  };
}
