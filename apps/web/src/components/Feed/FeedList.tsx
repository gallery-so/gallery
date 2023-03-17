import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { FeedMode } from '~/components/Feed/types';
import { FeedListEventDataFragment$key } from '~/generated/FeedListEventDataFragment.graphql';
import { FeedListFragment$key } from '~/generated/FeedListFragment.graphql';

import FeedEvent from './FeedEvent';

type Props = {
  loadNextPage: () => void;
  hasNext: boolean;
  queryRef: FeedListFragment$key;
  feedEventRefs: FeedListEventDataFragment$key;
  feedMode: FeedMode;
};

export default function FeedList({
  feedEventRefs,
  loadNextPage,
  hasNext,
  queryRef,
  feedMode,
}: Props) {
  const query = useFragment(
    graphql`
      fragment FeedListFragment on Query {
        ...FeedEventWithErrorBoundaryQueryFragment
      }
    `,
    queryRef
  );

  const feedData = useFragment(
    graphql`
      fragment FeedListEventDataFragment on FeedEvent @relay(plural: true) {
        dbid

        ...FeedEventWithErrorBoundaryFragment
      }
    `,
    feedEventRefs
  );

  const parentRef = useRef<HTMLDivElement>(null);
  const parentOffsetRef = useRef(0);

  const virtualizer = useWindowVirtualizer({
    count: hasNext ? feedData.length + 1 : feedData.length,
    estimateSize: () => 800,
    scrollMargin: parentOffsetRef.current,
    overscan: 5,
  });

  const feeds = virtualizer.getVirtualItems();
  useLayoutEffect(() => {
    parentOffsetRef.current = parentRef.current?.offsetTop ?? 0;
  }, []);

  const [isLoading, setIsLoading] = useState(false);

  const handleLoadMoreClick = useCallback(async () => {
    setIsLoading(true);
    await loadNextPage();
    setIsLoading(false);
  }, [loadNextPage]);

  useEffect(() => {
    const [lastItem] = [...feeds].reverse();

    if (!lastItem) {
      return;
    }

    if (lastItem.index >= feedData.length - 1 && hasNext && !isLoading) {
      handleLoadMoreClick();
    }
  }, [feedData.length, feeds, hasNext, isLoading, handleLoadMoreClick]);

  if (!feeds.length) {
    return null;
  }

  return (
    <StyledFeedList ref={parentRef} height={virtualizer.getTotalSize()}>
      <StyledFeedListContainer
        yPosition={(feeds[0]?.start ?? 0) - virtualizer.options.scrollMargin}
      >
        {feeds.map((virtualItem) => {
          // graphql returns the oldest event at the top of the list, so display in opposite order
          const content = feedData[feedData.length - virtualItem.index - 1];

          // Better safe than sorry :)
          if (!content) {
            return;
          }

          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
            >
              <FeedEvent
                eventRef={content}
                key={content.dbid}
                queryRef={query}
                feedMode={feedMode}
              />
            </div>
          );
        })}
      </StyledFeedListContainer>
    </StyledFeedList>
  );
}

const StyledFeedList = styled.div<{
  height: number;
}>`
  height: ${({ height }) => height}px;
  width: 100%;
  position: relative;
`;

const StyledFeedListContainer = styled.div<{
  yPosition: number;
}>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  transform: translateY(${({ yPosition }) => yPosition}px);
`;
