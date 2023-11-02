import { useCallback, useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

import { fetchSanityContent } from './sanity';

type SanityMaintenanceModeResponse = {
  isActive: boolean;
  message: string;
};

export function useSanityMaintenanceCheck() {
  const [sanityLoadedOrError, setSanityLoadedOrError] = useState(false);
  const [sanityMaintenanceModeResponse, setSanityMaintenanceModeResponse] =
    useState<SanityMaintenanceModeResponse | null>(null);

  const fetchMaintenanceModeFromSanity = useCallback(async () => {
    try {
      const response = await Promise.race([
        fetchSanityContent('*[_type == "maintenanceMode"][0] { isActive, message }'),
        new Promise(
          (_, reject) =>
            setTimeout(() => reject(new Error('Request timed out after 3 seconds')), 3000) // give Sanity 3 seconds max to respond so we don't block the app from loading if Sanity is down
        ),
      ]);
      setSanityMaintenanceModeResponse(response);
    } finally {
      // the app is ready to be shown in these 3 cases: Sanity responded with a valid response, Sanity responded with an error, or Sanity timed out
      setSanityLoadedOrError(true);
    }
  }, []);

  useEffect(
    function fetchMaintenanceModeOnAppLoad() {
      fetchMaintenanceModeFromSanity();
    },
    [fetchMaintenanceModeFromSanity]
  );

  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(
    function fetchMaintenanceModeOnAppForeground() {
      const handleAppStateChange = (nextAppState: AppStateStatus) => {
        if ((appState === 'inactive' || appState === 'background') && nextAppState === 'active') {
          // app has come into the foreground
          fetchMaintenanceModeFromSanity();
        }
        setAppState(nextAppState);
      };
      const listener = AppState.addEventListener('change', handleAppStateChange);
      return () => {
        listener.remove();
      };
    },
    [appState, fetchMaintenanceModeFromSanity]
  );

  return {
    maintenanceCheckLoadedOrError: sanityLoadedOrError,
    maintenanceModeResponse: sanityMaintenanceModeResponse,
  };
}
