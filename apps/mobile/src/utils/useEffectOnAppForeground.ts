import { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export function useEffectOnAppForeground(callback: () => void) {
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(
    function fetchMaintenanceModeOnAppForeground() {
      const handleAppStateChange = (nextAppState: AppStateStatus) => {
        if ((appState === 'inactive' || appState === 'background') && nextAppState === 'active') {
          // app has come into the foreground
          callback();
        }
        setAppState(nextAppState);
      };
      const listener = AppState.addEventListener('change', handleAppStateChange);
      return () => {
        listener.remove();
      };
    },
    [appState, callback]
  );
}
