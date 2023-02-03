import { useCallback, useRef } from 'react';

import { useTrack } from '~/contexts/analytics/AnalyticsContext';

export function useTrackLoadMoreFeedEvents() {
  const track = useTrack();
  const pageNum = useRef(0);

  return useCallback(
    (mode: 'latest' | 'latest-following' | 'trending' | 'viewer') => {
      track('Feed: Clicked load more events', {
        pageNum: ++pageNum.current,
        mode,
      });
    },
    [track]
  );
}
