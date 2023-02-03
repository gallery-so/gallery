import { useCallback, useEffect, useState } from 'react';

export default function useKeyDown(targetKey: string, callbackFn: () => void) {
  // State for keeping track of whether key is pressed
  const [keyPressed, setKeyPressed] = useState<boolean>(false);

  // If pressed key is our target key then set to true
  const pressHandler = useCallback(
    (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      setKeyPressed(event.key === targetKey);
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

  // useEffect ensures that the callback function is called once, which is relevant when navigating
  useEffect(() => {
    if (keyPressed) {
      callbackFn();

      // After executing, reset keyPressed to false so that the user can click the same key again on the same page
      // Only currently relevant if user is on /edit -> escapes -> shows modal -> escapes -> clicks escape again
      // This also prevents route-based navigation from duplicating
      setKeyPressed(false);
    }
  }, [keyPressed, callbackFn]);
}
