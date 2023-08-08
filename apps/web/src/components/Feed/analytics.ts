import { useCallback, useRef } from 'react';

import { useTrack } from '~/shared/contexts/AnalyticsContext';

export function useTrackLoadMoreFeedEvents() {
  const track = useTrack();
  const pageNum = useRef(0);

  return useCallback(
    (mode: 'latest' | 'latest-following' | 'curated' | 'viewer') => {
      track('Feed: Clicked load more events', {
        pageNum: ++pageNum.current,
        mode,
      });
    },
    [track]
  );
}
