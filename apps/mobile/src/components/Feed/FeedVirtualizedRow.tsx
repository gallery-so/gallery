import { useMemo } from 'react';

import { FeedListItemType } from '~/components/Feed/createVirtualizedFeedEventItems';
import { FeedListCaption } from '~/components/Feed/FeedListCaption';
import { FeedListItem } from '~/components/Feed/FeedListItem';
import { FeedListSectionHeader } from '~/components/Feed/FeedListSectionHeader';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';

type Props = {
  eventId: string;
  item: FeedListItemType;
  onFailure: () => void;
};

export function FeedVirtualizedRow({ onFailure, item, eventId }: Props) {
  const inner = useMemo(() => {
    switch (item.kind) {
      case 'feed-item-header':
        return <FeedListSectionHeader feedEventRef={item.event} />;
      case 'feed-item-caption':
        return <FeedListCaption feedEventRef={item.event} />;
      case 'feed-item-event':
        return (
          <FeedListItem eventId={item.event.dbid} eventDataRef={item.event.eventData ?? null} />
        );
    }
  }, [item.event, item.kind]);

  return (
    <ReportingErrorBoundary fallback={null} onError={onFailure} additionalTags={{ eventId }}>
      {inner}
    </ReportingErrorBoundary>
  );
}
