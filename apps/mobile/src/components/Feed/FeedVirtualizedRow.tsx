import { useMemo } from 'react';

import { FeedListItemType } from '~/components/Feed/createVirtualizedFeedEventItems';
import { FeedListItem } from '~/components/Feed/FeedListItem';
import { FeedListSectionHeader } from '~/components/Feed/FeedListSectionHeader';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';

type Props = {
  item: FeedListItemType;
  onFailure: () => void;
};

export function FeedVirtualizedRow({ onFailure, item }: Props) {
  const inner = useMemo(() => {
    switch (item.kind) {
      case 'feed-item-header':
        return <FeedListSectionHeader feedEventRef={item.event} />;
      case 'feed-item-caption':
        return <FeedListCaption feedEventRef={item.event} />;
      case 'feed-item-event':
        if (!item.event.eventData) return null;

        return <FeedListItem eventId={item.event.dbid} eventDataRef={item.event.eventData} />;
    }
  }, [item.event, item.kind]);

  return (
    <ReportingErrorBoundary fallback={null} onError={onFailure}>
      {inner}
    </ReportingErrorBoundary>
  );
}
