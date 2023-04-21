import { useCallback, useState } from 'react';

export function useFailedEventTracker() {
  const [failedEvents, setFailedEvents] = useState<Set<string>>(new Set());

  const markEventAsFailure = useCallback((eventId: string) => {
    setFailedEvents((previous) => {
      const next = new Set(previous);
      next.add(eventId);
      return next;
    });
  }, []);

  return { failedEvents, markEventAsFailure };
}
