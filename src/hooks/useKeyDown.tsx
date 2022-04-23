import { useState, useEffect, useCallback } from 'react';

export default function useKeyDown(targetKey: string, callbackFn: () => void) {
  // State for keeping track of whether key is pressed
  const [keyPressed, setKeyPressed] = useState<boolean>(false);

  // If pressed key is our target key then set to true
  const pressHandler = useCallback(
    ({ key }: KeyboardEvent) => {
      if (key === targetKey) {
        setKeyPressed(true);
      } else {
        setKeyPressed(false);
      }
    },
    [targetKey]
  );

  // Add event listeners
  useEffect(() => {
    window.addEventListener('keyup', pressHandler);
    return () => {
      window.removeEventListener('keyup', pressHandler);
    };
  }, [pressHandler]);

  const activeEl = document.activeElement;

  // useEffect ensures that the callback function is called once, which is relevant when navigating
  useEffect(() => {
    // If the user is currently focused on a textarea, return to prevent accidental navigation
    if (activeEl?.tagName == 'TEXTAREA') return;

    if (keyPressed) {
      callbackFn();
      // After executing, reset keyPressed to false so that the user can click the same key again on the same page
      // Only currently relevant if user is on /edit -> escapes -> shows modal -> escapes -> clicks escape again
      // This also prevents route-based navigation from duplicating
      setKeyPressed(false);
    }
  }, [keyPressed, callbackFn, activeEl]);
}
