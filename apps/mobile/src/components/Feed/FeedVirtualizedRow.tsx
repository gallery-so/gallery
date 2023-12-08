import { useMemo } from 'react';

import { FeedListItemType } from '~/components/Feed/createVirtualizedFeedEventItems';
import { FeedListCaption } from '~/components/Feed/FeedListCaption';
import { FeedListItem } from '~/components/Feed/FeedListItem';
import { FeedListSectionHeader } from '~/components/Feed/FeedListSectionHeader';
import { FeedEventSocializeSection } from '~/components/Feed/Socialize/FeedEventSocializeSection';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';

import { FeedFilter } from './FeedFilter';
import { FeedPostSocializeSection } from './Posts/FeedPostSocializeSection';
import { PostListCaption } from './Posts/PostListCaption';
import { PostListItem } from './Posts/PostListItem';
import { PostListMintButtonSection } from './Posts/PostListMintButtonSection';
import { PostListSectionHeader } from './Posts/PostListSectionHeader';

type Props = {
  item: FeedListItemType;
  onFailure: () => void;
};

export function FeedVirtualizedRow({ onFailure, item }: Props) {
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

      case 'post-item-header':
        return <PostListSectionHeader feedPostRef={item.post} queryRef={item.queryRef} />;

      case 'feed-item-socialize':
        return (
          <FeedEventSocializeSection
            feedEventRef={item.event}
            queryRef={item.queryRef}
            onCommentPress={item.onCommentPress}
          />
        );

      case 'post-item-caption':
        return <PostListCaption feedPostRef={item.post} />;
      case 'post-item-event':
        return <PostListItem feedPostRef={item.post} queryRef={item.queryRef} />;
      case 'post-item-socialize':
        return (
          <FeedPostSocializeSection
            feedPostRef={item.post}
            queryRef={item.queryRef}
            onCommentPress={item.onCommentPress}
          />
        );
      case 'post-item-mint-link':
        return <PostListMintButtonSection postRef={item.post} />;
    }
  }, [item]);

  let itemId: string | null = null;

  if (item.post) {
    itemId = item.post.dbid;
  } else if (item.event) {
    itemId = item.event.dbid;
  } else {
    itemId = item.eventId;
  }

  return (
    <ReportingErrorBoundary
      fallback={null}
      onError={onFailure}
      additionalTags={{ eventId: itemId }}
    >
      {inner}
    </ReportingErrorBoundary>
  );
}
