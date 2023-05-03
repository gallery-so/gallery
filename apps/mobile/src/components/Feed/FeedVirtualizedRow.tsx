import { FeedListItemType } from '~/components/Feed/createVirtualizedFeedEventItems';
import { FeedListCaption } from '~/components/Feed/FeedListCaption';
import { FeedListItem } from '~/components/Feed/FeedListItem';
import { FeedListSectionHeader } from '~/components/Feed/FeedListSectionHeader';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';

type Props = {
  item: FeedListItemType;
  onFailure: () => void;
};

export function FeedVirtualizedRow({ onFailure, item }: Props) {
  switch (item.kind) {
    case 'feed-item-header':
      return (
        <ReportingErrorBoundary fallback={null} onError={onFailure}>
          <FeedListSectionHeader feedEventRef={item.event} />
        </ReportingErrorBoundary>
      );
    case 'feed-item-caption':
      return (
        <ReportingErrorBoundary fallback={null} onError={onFailure}>
          <FeedListCaption feedEventRef={item.event} />
        </ReportingErrorBoundary>
      );
    case 'feed-item-event':
      if (!item.event.eventData) return null;

      return (
        <ReportingErrorBoundary fallback={null} onError={onFailure}>
          <FeedListItem eventId={item.event.dbid} eventDataRef={item.event.eventData} />
        </ReportingErrorBoundary>
      );
  }
}
