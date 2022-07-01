import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { useCallback, useRef } from 'react';

export function useTrackLoadMoreFeedEvents() {
  const track = useTrack();
  const pageNum = useRef(0);

  return useCallback(
    (mode: 'global' | 'viewer') => {
      track('Feed: Clicked load more events', {
        pageNum: ++pageNum.current,
        mode,
      });
    },
    [track]
  );
}
