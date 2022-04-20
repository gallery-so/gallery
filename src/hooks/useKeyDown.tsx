import { useState, useEffect, useCallback } from 'react';

export default function useKeyDown(targetKey: string, callbackFn: () => void) {
  // State for keeping track of whether key is pressed
  const [keyPressed, setKeyPressed] = useState<boolean>(false);

  // If pressed key is our target key then set to true
  const pressHandler = useCallback(
    ({ key }: KeyboardEvent) => {
      if (key === targetKey) {
        setKeyPressed(true);
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

  // useEffect ensures that the callback function is called once, which is relevant when navigating
  useEffect(() => {
    // If the user is not currently focused on the body, return
    const activeEl = document.activeElement;
    if (activeEl?.tagName !== 'BODY') return;

    if (keyPressed) {
      console.log('run');
      callbackFn();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyPressed]); // FIXME: Including callbackFn in the dependency array triggers duplication of navigation-based callbacks, so it is omitted
}
