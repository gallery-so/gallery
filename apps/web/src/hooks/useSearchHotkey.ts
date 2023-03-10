import { useEffect, useRef } from 'react';

export function useSearchHotkey(callback: () => void) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    function handlePress(event: KeyboardEvent) {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        callbackRef.current();
      }
    }

    window.addEventListener('keydown', handlePress);

    return () => window.removeEventListener('keydown', handlePress);
  }, []);
}
