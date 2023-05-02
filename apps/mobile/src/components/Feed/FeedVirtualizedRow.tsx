import { FeedListItemType } from '~/components/Feed/createVirtualizedItemsFromFeedEvents';
import { FeedListCaption } from '~/components/Feed/FeedListCaption';
import { FeedListItem } from '~/components/Feed/FeedListItem';
import { FeedListSectionHeader } from '~/components/Feed/FeedListSectionHeader';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';
import { FeedEventSocializeSection } from './Socialize/FeedEventSocializeSection';
import { FeedEventSocializeSectionQueryFragment$key } from '~/generated/FeedEventSocializeSectionQueryFragment.graphql';

type Props = {
  item: FeedListItemType;
  onFailure: () => void;
  query: FeedEventSocializeSectionQueryFragment$key;
};

export function FeedVirtualizedRow({ onFailure, item, query }: Props) {
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
    case 'feed-item-socialize':
      return (
        <ReportingErrorBoundary fallback={null} onError={onFailure}>
          <FeedEventSocializeSection feedEventRef={item.event} queryRef={query} />
        </ReportingErrorBoundary>
      );
  }
}
