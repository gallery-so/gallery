import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export function useIntervalEffectOnAppForeground(callback: () => void) {
  useEffect(() => {
    let interval: NodeJS.Timeout;

    // Set up the interval when the component mounts
    interval = setInterval(callback, 10000);

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // When the app comes into the foreground, trigger the callback
        // and kick off the interval
        callback();
        interval = setInterval(callback, 10000);
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        // When the app goes to the background, clear the interval
        if (interval) {
          clearInterval(interval);
        }
      }
    };

    // Add event listener for app state changes
    const listener = AppState.addEventListener('change', handleAppStateChange);

    // Clear the interval when the component unmounts
    return () => {
      clearInterval(interval);
      listener.remove();
    };
  }, [callback]);
}
