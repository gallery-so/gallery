import { useMemo } from 'react';

import { FeedListItemType } from '~/components/Feed/createVirtualizedFeedEventItems';
import { FeedListCaption } from '~/components/Feed/FeedListCaption';
import { FeedListItem } from '~/components/Feed/FeedListItem';
import { FeedListSectionHeader } from '~/components/Feed/FeedListSectionHeader';
import { FeedEventSocializeSection } from '~/components/Feed/Socialize/FeedEventSocializeSection';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';

import { FeedFilter } from './FeedFilter';

type Props = {
  eventId: string;
  item: FeedListItemType;
  onFailure: () => void;
};

export function FeedVirtualizedRow({ onFailure, item, eventId }: Props) {
  const inner = useMemo(() => {
    switch (item.kind) {
      case 'feed-item-navigation':
        return <FeedFilter activeFeed={item.activeFeed} onChange={item.onFilterChange} />;
      case 'feed-item-header':
        return <FeedListSectionHeader feedEventRef={item.event} />;
      case 'feed-item-caption':
        return <FeedListCaption feedEventRef={item.event} />;
      case 'feed-item-event':
        return (
          <FeedListItem
            eventId={item.event.dbid}
            queryRef={item.queryRef}
            eventDataRef={item.event ?? null}
          />
        );
      case 'feed-item-socialize':
        return (
          <FeedEventSocializeSection
            feedEventRef={item.event}
            queryRef={item.queryRef}
            onCommentPress={item.onCommentPress}
          />
        );
    }
  }, [item]);

  return (
    <ReportingErrorBoundary fallback={null} onError={onFailure} additionalTags={{ eventId }}>
      {inner}
    </ReportingErrorBoundary>
  );
}
