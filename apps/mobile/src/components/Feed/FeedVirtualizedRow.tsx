import { useCallback, useMemo } from 'react';

import { FeedListItemType } from '~/components/Feed/createVirtualizedFeedEventItems';
import { FeedListCaption } from '~/components/Feed/FeedListCaption';
import { FeedListItem } from '~/components/Feed/FeedListItem';
import { FeedListSectionHeader } from '~/components/Feed/FeedListSectionHeader';
import { FeedEventSocializeSection } from '~/components/Feed/Socialize/FeedEventSocializeSection';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';

type Props = {
  eventId: string;
  item: FeedListItemType;
  onFailure: () => void;
  onCommentPress: (key: FeedListItemType) => void;
};

export function FeedVirtualizedRow({ onCommentPress, onFailure, item, eventId }: Props) {
  const handleScrollToElement = useCallback(() => {
    onCommentPress(item);
  }, [onCommentPress, item]);

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
      case 'feed-item-socialize':
        return (
          <FeedEventSocializeSection
            feedEventRef={item.event}
            queryRef={item.queryRef}
            onCommentPress={handleScrollToElement}
          />
        );
    }
  }, [handleScrollToElement, item.event, item.kind, item.queryRef]);

  return (
    <ReportingErrorBoundary fallback={null} onError={onFailure} additionalTags={{ eventId }}>
      {inner}
    </ReportingErrorBoundary>
  );
}
