import { useState, useEffect, useCallback, useMemo } from 'react';

const INITIAL_STATE = new Map();

export default function useMultiKeyDown(targetKeys: string[], callbackFn: () => void) {
  if (!targetKeys.length) {
    throw new Error('target keys must be provided');
  }

  // State for keeping track of whether key is pressed
  const [keyPressedMap, setKeyPressedMap] = useState<Map<string, boolean>>(INITIAL_STATE);

  const areTargetKeysPressed = useMemo(() => {
    return targetKeys.reduce((curr, key) => {
      return Boolean(curr && keyPressedMap.get(key));
    }, true);
  }, [keyPressedMap, targetKeys]);

  const handleToggleKeypress = useCallback(
    (key, status) => {
      setKeyPressedMap((prev) => {
        const next = new Map(prev);
        if (targetKeys.includes(key)) {
          next.set(key, status);
        }
        return next;
      });
    },
    [targetKeys]
  );

  const handleKeyUp = useCallback(
    ({ key }: KeyboardEvent) => {
      handleToggleKeypress(key, false);
    },
    [handleToggleKeypress]
  );

  const handleKeyDown = useCallback(
    ({ key }: KeyboardEvent) => {
      handleToggleKeypress(key, true);
    },
    [handleToggleKeypress]
  );

  // Add event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // useEffect ensures that the callback function is called once, which is relevant when navigating
  useEffect(() => {
    if (areTargetKeysPressed) {
      callbackFn();

      // After executing, reset keyPressed to false so that the user can click the same key again on the same page
      // Only currently relevant if user is on /edit -> escapes -> shows modal -> escapes -> clicks escape again
      // This also prevents route-based navigation from duplicating
      setKeyPressedMap(INITIAL_STATE);
    }
  }, [areTargetKeysPressed, callbackFn]);
}
