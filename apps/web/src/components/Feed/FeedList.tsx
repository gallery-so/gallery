import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  List,
  WindowScroller,
} from 'react-virtualized';
import { MeasuredCellParent } from 'react-virtualized/dist/es/CellMeasurer';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import colors from '~/components/core/colors';
import Loader from '~/components/core/Loader/Loader';
import { TitleM } from '~/components/core/Text/Text';
import transitions from '~/components/core/transitions';
import { FeedListEventDataFragment$key } from '~/generated/FeedListEventDataFragment.graphql';
import { FeedListFragment$key } from '~/generated/FeedListFragment.graphql';

import { FeedMode } from './Feed';
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
    ({ index }: { index: number }) => !hasNext || !!feedData[index],
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
              <FeedEvent
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
    },
    [feedData, feedMode, handlePotentialLayoutShift, isRowLoaded, measurerCache, query]
  );

  const [isLoading, setIsLoading] = useState(false);

  const handleLoadMoreClick = useCallback(async () => {
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

  return (
    <WindowScroller>
      {({ height, scrollTop, registerChild }) => (
        <AutoSizer disableHeight>
          {({ width }) => (
            // @ts-expect-error shitty react-virtualized types
            <div ref={registerChild}>
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
                overscanRowCount={10}
                // By default, react-virtualized's list has the css property `will-change` set to `transform`
                // An element with `position: fixed` beneath an element with `will-change: transform` will
                // be incredibly busted. You can read more about that [here](https://stackoverflow.com/questions/28157125/why-does-transform-break-position-fixed)
                //
                // Simply setting this back to it's original `auto` seems to do the trick and shouldn't have
                // any serious performance implications from some trivial testing that was done.
                style={{ willChange: 'auto', outline: 'none' }}
              />
              {hasNext && (
                <StyledLoadMoreRow width={width} onClick={handleLoadMoreClick}>
                  {isLoading ? <Loader inverted size="small" /> : <TitleM>More</TitleM>}
                </StyledLoadMoreRow>
              )}
            </div>
          )}
        </AutoSizer>
      )}
    </WindowScroller>
  );
}

const StyledLoadMoreRow = styled.div<{ width: number }>`
  width: ${({ width }) => width}px;
  display: flex;
  align-items: center;
  justify-content: center;

  height: 92px;
  @media only screen and ${breakpoints.tablet} {
    height: 156px;
  }
  transition: background ${transitions.cubic};
  ${TitleM} {
    font-style: normal;
    color: ${colors.shadow};
    transition: color ${transitions.cubic};
  }
  &:hover {
    background: ${colors.faint};
    ${TitleM} {
      color: ${colors.offBlack};
    }
  }
  cursor: pointer;
`;
