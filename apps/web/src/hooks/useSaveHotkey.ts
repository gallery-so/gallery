import { useEffect, useRef } from 'react';

export function useSaveHotkey(callback: () => void) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    function handlePress(event: KeyboardEvent) {
      if (event.key === 's' && (event.metaKey || event.ctrlKey)) {
        // Avoid trying to save page as HTML
        event.preventDefault();

        callbackRef.current();
      }
    }

    window.addEventListener('keydown', handlePress);

    return () => window.removeEventListener('keydown', handlePress);
  }, []);
}
