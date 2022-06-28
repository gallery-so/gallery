import { useMemo } from 'react';
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  InfiniteLoader,
  List,
  WindowScroller,
} from 'react-virtualized';
import FeedEvent from './FeedEvent';

type Props = {
  feedData: any;
  onLoadNext: () => void;
  hasNext: boolean;
};

export default function FeedList({ feedData, onLoadNext, hasNext }: Props) {
  const measurerCache = useMemo(() => {
    return new CellMeasurerCache({
      fixedWidth: true,
      minHeight: 50,
    });
  }, []);

  // Every row is loaded except for our loading indicator row.
  const isRowLoaded = ({ index }) => !hasNext || index < feedData.edges.size;

  //Render a list item or a loading indicator.
  const rowRenderer = ({
    index,
    key,
    parent,
    style,
  }: {
    index: number;
    key: string;
    style: string;
  }) => {
    let content;

    if (!isRowLoaded({ index })) {
      return <div></div>;
    } else {
      content = feedData.edges[index];
      return (
        <CellMeasurer
          cache={measurerCache}
          columnIndex={0}
          rowIndex={index}
          key={key}
          parent={parent}
        >
          {({ measure, registerChild }) => (
            <div ref={registerChild} style={style}>
              <FeedEvent queryRef={content.node.eventData} key={content.node.dbid} />
            </div>
          )}
        </CellMeasurer>
      );
    }
  };

  // If there are more items to be loaded then add an extra row to hold a loading indicator.
  const rowCount = hasNext ? feedData.edges.length + 10 : feedData.edges.length;
  // Only load 1 page of items at a time.
  // Pass an empty callback to InfiniteLoader in case it asks us to load more than once.
  const isNextPageLoading = false;
  const loadMoreRows = isNextPageLoading ? () => {} : onLoadNext;

  return (
    <InfiniteLoader
      isRowLoaded={isRowLoaded}
      loadMoreRows={loadMoreRows}
      rowCount={rowCount}
      threshold={5}
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
