import { useMemo } from 'react';
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  InfiniteLoader,
  List,
  WindowScroller,
} from 'react-virtualized';
import { MeasuredCellParent } from 'react-virtualized/dist/es/CellMeasurer';
import { FeedEventQueryFragment$key } from '__generated__/FeedEventQueryFragment.graphql';
import { FeedMode } from './Feed';
import FeedEvent from './FeedEvent';

type Props = {
  feedData: any;
  onLoadNext: () => void;
  hasNext: boolean;
  queryRef: FeedEventQueryFragment$key;
  isNextPageLoading: boolean;
  feedMode: FeedMode;
};

export default function FeedList({
  feedData,
  onLoadNext,
  hasNext,
  queryRef,
  isNextPageLoading,
  feedMode,
}: Props) {
  const measurerCache = useMemo(() => {
    return new CellMeasurerCache({
      fixedWidth: true,
      minHeight: 0,
    });
  }, []);

  // Function responsible for tracking the loaded state of each row.
  const isRowLoaded = ({ index }: { index: number }) => !hasNext || !!feedData.edges[index];

  //Render a list item or a loading indicator.
  const rowRenderer = ({
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
    const content = feedData.edges[feedData.edges.length - index - 1];

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
          <div ref={registerChild} style={style}>
            <FeedEvent
              eventRef={content.node.eventData}
              key={content.node.dbid}
              queryRef={queryRef}
              feedMode={feedMode}
            />
          </div>
        )}
      </CellMeasurer>
    );
  };

  // If there are more items to be loaded then add extra rows
  const rowCount = hasNext ? feedData.edges.length + 1 : feedData.edges.length;
  // Only load 1 page of items at a time.
  // Pass an empty callback to InfiniteLoader in case it asks us to load more than once.
  const loadMoreRows = isNextPageLoading ? () => {} : onLoadNext;

  return (
    <InfiniteLoader
      isRowLoaded={isRowLoaded}
      // @ts-expect-error: loadMoreRows type expects a function that returns a promise, but react-virtualized docs suggest passing an empty callback in some scenarios
      loadMoreRows={loadMoreRows}
      rowCount={rowCount}
      threshold={2}
    >
      {({ onRowsRendered, registerChild }) => (
        <WindowScroller>
          {({ height, scrollTop }) => (
            <AutoSizer disableHeight>
              {({ width }) => (
                <List
                  ref={registerChild}
                  autoHeight
                  width={width}
                  height={height}
                  onRowsRendered={onRowsRendered}
                  rowRenderer={rowRenderer}
                  rowCount={rowCount}
                  rowHeight={measurerCache.rowHeight}
                  scrollTop={scrollTop}
                />
              )}
            </AutoSizer>
          )}
        </WindowScroller>
      )}
    </InfiniteLoader>
  );
}
