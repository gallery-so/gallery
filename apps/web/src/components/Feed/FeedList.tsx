import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  InfiniteLoader,
  List,
  WindowScroller,
} from 'react-virtualized';
import { MeasuredCellParent } from 'react-virtualized/dist/es/CellMeasurer';

import { FeedMode } from '~/components/Feed/types';
import { FeedListEventDataFragment$key } from '~/generated/FeedListEventDataFragment.graphql';
import { FeedListFragment$key } from '~/generated/FeedListFragment.graphql';

import FeedEventItem from './FeedEventItem';
import { PostItemWithBoundary as PostItem } from './PostItem';

type Props = {
  loadNextPage: () => void;
  hasNext: boolean;
  queryRef: FeedListFragment$key;
  feedEventRefs: FeedListEventDataFragment$key;
  feedMode?: FeedMode;
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
        ...PostItemWithErrorBoundaryQueryFragment
        ...FeedEventItemWithErrorBoundaryQueryFragment
      }
    `,
    queryRef
  );

  const feedData = useFragment(
    graphql`
      fragment FeedListEventDataFragment on FeedEventOrError @relay(plural: true) {
        __typename
        ... on FeedEvent {
          dbid
        }
        ... on Post {
          dbid
        }
        ...PostItemWithErrorBoundaryFragment
        ...FeedEventItemWithErrorBoundaryFragment
      }
    `,
    feedEventRefs
  );

  // Keep the current feed data in a ref so we can access it below in the
  // CellMeasurerCache's keyMapper without having to create a new cache
  // every time the feed data changes.
  const feedDataRef = useRef(feedData);
  feedDataRef.current = feedData;

  const measurerCache = useMemo(() => {
    return new CellMeasurerCache({
      // This is critical to ensure heights aren't cached from the wrong item.
      // Typically, RV wil use the index of the row as a cache key.
      // This immediately becomes a problem when we load new content
      // at the top of the list. e.g. index 0 gets replaced w/ new content
      // and has a different height than the item preceding it.
      keyMapper: (rowIndex) => {
        return feedDataRef.current[feedDataRef.current.length - rowIndex - 1]?.dbid;
      },
      defaultHeight: 400,
      fixedWidth: true,
      minHeight: 0,
    });
  }, []);

  // Function responsible for tracking the loaded state of each row.
  const isRowLoaded = useCallback(
    ({ index }: { index: number }) => !hasNext || Boolean(feedData[index]),
    [feedData, hasNext]
  );

  const virtualizedListRef = useRef<List | null>(null);

  const handlePotentialLayoutShift = useCallback(
    (index: number) => {
      measurerCache.clear(index, 0);
      virtualizedListRef.current?.recomputeRowHeights(index);
    },
    [measurerCache]
  );

  //Render a list item or a loading indicator.
  const rowRenderer = useCallback(
    ({
      index,
      key,
      parent,
      style,
    }: {
      index: number;
      key: string;
      style: React.CSSProperties;
      parent: MeasuredCellParent;
    }) => {
      if (!isRowLoaded({ index })) {
        return <div />;
      }
      // graphql returns the oldest event at the top of the list, so display in opposite order
      const content = feedData[feedData.length - index - 1];

      // Better safe than sorry :)
      if (!content) {
        return;
      }

      if (content.__typename === 'Post') {
        return (
          <CellMeasurer
            cache={measurerCache}
            columnIndex={0}
            rowIndex={index}
            key={key}
            parent={parent}
          >
            {({ measure, registerChild }) => (
              // @ts-expect-error: this is the suggested usage of registerChild
              <div ref={registerChild} style={style} key={key}>
                <PostItem
                  onPotentialLayoutShift={handlePotentialLayoutShift}
                  index={index}
                  eventRef={content}
                  key={content.dbid}
                  queryRef={query}
                  measure={measure}
                />
              </div>
            )}
          </CellMeasurer>
        );
      }

      if (content.__typename === 'FeedEvent' && feedMode) {
        return (
          <CellMeasurer
            cache={measurerCache}
            columnIndex={0}
            rowIndex={index}
            key={key}
            parent={parent}
          >
            {({ registerChild }) => (
              // @ts-expect-error: this is the suggested usage of registerChild
              <div ref={registerChild} style={style} key={key}>
                <FeedEventItem
                  // Here, we're listening to our children for anything that might cause
                  // the height of this list item to change height.
                  // Right now, this consists of "admiring", and "commenting"
                  //
                  // Whenever the height changes, we need to ask react-virtualized
                  // to re-evaluate the height of the item to keep the virtualization good.
                  onPotentialLayoutShift={handlePotentialLayoutShift}
                  index={index}
                  eventRef={content}
                  key={content.dbid}
                  queryRef={query}
                  feedMode={feedMode}
                />
              </div>
            )}
          </CellMeasurer>
        );
      }

      return null;
    },
    [feedData, feedMode, handlePotentialLayoutShift, isRowLoaded, measurerCache, query]
  );

  const [, setIsLoading] = useState(false);

  const handleLoadMore = useCallback(async () => {
    setIsLoading(true);
    await loadNextPage();
    setIsLoading(false);
  }, [loadNextPage]);

  useEffect(
    function recalculateHeightsWhenEventsChange() {
      virtualizedListRef.current?.recomputeRowHeights();
    },
    [feedData, measurerCache]
  );

  const rowCount = hasNext ? feedData.length + 1 : feedData.length;

  return (
    <WindowScroller>
      {({ height, scrollTop, registerChild }) => (
        <AutoSizer disableHeight>
          {({ width }) => (
            // @ts-expect-error shitty react-virtualized types
            <div ref={(el) => registerChild(el)}>
              <InfiniteLoader
                isRowLoaded={isRowLoaded}
                loadMoreRows={handleLoadMore}
                rowCount={rowCount}
              >
                {({ onRowsRendered, registerChild }) => (
                  // calling registerChild resets the scroll position which fixes an issue where upon remounting this list, virtualization didn't work
                  // https://github.com/bvaughn/react-virtualized/issues/1324
                  <div ref={(el) => registerChild(el)}>
                    <List
                      className="FeedList"
                      ref={virtualizedListRef}
                      autoHeight
                      width={width}
                      height={height}
                      rowRenderer={rowRenderer}
                      rowCount={feedData.length}
                      rowHeight={measurerCache.rowHeight}
                      scrollTop={scrollTop}
                      overscanRowCount={2}
                      onRowsRendered={onRowsRendered}
                      // By default, react-virtualized's list has the css property `will-change` set to `transform`
                      // An element with `position: fixed` beneath an element with `will-change: transform` will
                      // be incredibly busted. You can read more about that [here](https://stackoverflow.com/questions/28157125/why-does-transform-break-position-fixed)
                      //
                      // Simply setting this back to it's original `auto` seems to do the trick and shouldn't have
                      // any serious performance implications from some trivial testing that was done.
                      style={{ willChange: 'auto', outline: 'none' }}
                    />
                  </div>
                )}
              </InfiniteLoader>
            </div>
          )}
        </AutoSizer>
      )}
    </WindowScroller>
  );
}
