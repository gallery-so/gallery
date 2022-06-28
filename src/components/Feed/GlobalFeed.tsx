import Button from 'components/core/Button/Button';
import Spacer from 'components/core/Spacer/Spacer';
import { useCallback, useMemo } from 'react';
import { graphql, useLazyLoadQuery, usePaginationFragment } from 'react-relay';
import useDisplayFullPageNftDetailModal from 'scenes/NftDetailPage/useDisplayFullPageNftDetailModal';
import styled from 'styled-components';
import { GlobalFeedQuery } from '__generated__/GlobalFeedQuery.graphql';
import FeedEvent from './FeedEvent';
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  InfiniteLoader,
  List,
  WindowScroller,
} from 'react-virtualized';
import { cache } from 'swr/dist/utils/config';

export default function GlobalFeed() {
  const pagination = {
    // limit: 4,
  };
  const first = 10;
  const query = useLazyLoadQuery<GlobalFeedQuery>(
    graphql`
      query GlobalFeedQuery($after: String, $first: Int) {
        ...GlobalFeedFragment
      }
    `,
    {
      first: first,
    }
  );

  const { data, loadNext, hasNext } = usePaginationFragment<GlobalFeedQuery, _>(
    graphql`
      fragment GlobalFeedFragment on Query @refetchable(queryName: "GlobalFeedPaginationQuery") {
        globalFeed(after: $after, first: $first) @connection(key: "GlobalFeed_globalFeed") {
          edges {
            node {
              ... on FeedEvent {
                dbid
                eventData {
                  ...FeedEventFragment
                }
              }
            }
            cursor
          }
          pageInfo {
            hasNextPage
            size
          }
        }
      }
    `,
    query
  );

  console.log('globalFeed', data, loadNext);
  useDisplayFullPageNftDetailModal();

  const handleClick = useCallback(() => {
    loadNext(10);
  }, [loadNext]);
  // if hasNextPage show button

  const measurerCache = useMemo(() => {
    return new CellMeasurerCache({
      fixedWidth: true,
      minHeight: 50,
    });
  }, []);

  // Every row is loaded except for our loading indicator row.
  const isRowLoaded = ({ index }) => !hasNext || index < data.globalFeed.edges.size;

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
      console.log('index', index, data.globalFeed.edges);
      content = data.globalFeed.edges[index];
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
  const rowCount = hasNext ? data.globalFeed.edges.length + 10 : data.globalFeed.edges.length;
  // Only load 1 page of items at a time.
  // Pass an empty callback to InfiniteLoader in case it asks us to load more than once.
  const isNextPageLoading = false;
  const loadMoreRows = isNextPageLoading ? () => {} : handleClick;

  console.log('rowCount', rowCount);
  console.log(data.globalFeed.edges.length);

  return (
    <StyledGlobalFeed>
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
                    // {...listProps}
                  />
                )}
              </AutoSizer>
            )}
          </WindowScroller>
        )}
      </InfiniteLoader>
      {hasNext && <Button text="More" onClick={handleClick} />}
    </StyledGlobalFeed>
  );
}

const StyledGlobalFeed = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  // background: yellow;
  flex: 1;
`;
