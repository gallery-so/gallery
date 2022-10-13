import breakpoints from 'components/core/breakpoints';
import colors from 'components/core/colors';
import Loader from 'components/core/Loader/Loader';
import { TitleM } from 'components/core/Text/Text';
import transitions from 'components/core/transitions';
import { useCallback, useMemo, useRef, useState } from 'react';
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

import { FeedListEventDataFragment$key } from '__generated__/FeedListEventDataFragment.graphql';
import { FeedListFragment$key } from '__generated__/FeedListFragment.graphql';
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

        eventData {
          eventTime
        }

        ...FeedEventWithErrorBoundaryFragment
      }
    `,
    feedEventRefs
  );

  const measurerCache = useMemo(() => {
    return new CellMeasurerCache({
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
                // Here, we're listening to our children for anything that might cause
                // the height of this list item to change height.
                // Right now, this consists of "admiring", and "commenting"
                //
                // Whenever the height changes, we need to ask react-virtualized
                // to re-evaluate the height of the item to keep the virtualization good.
                onPotentialLayoutShift={() => {
                  measurerCache.clear(index, 0);
                  virtualizedListRef.current?.recomputeRowHeights();
                }}
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
    [feedData, feedMode, isRowLoaded, measurerCache, query]
  );

  // If there are more items to be loaded then add extra rows
  const rowCount = hasNext ? feedData.length + 1 : feedData.length;

  const [isLoading, setIsLoading] = useState(false);

  const handleLoadMoreClick = useCallback(async () => {
    setIsLoading(true);
    await loadNextPage();
    setIsLoading(false);
  }, [loadNextPage]);

  return (
    <WindowScroller>
      {({ height, scrollTop, registerChild }) => (
        <AutoSizer disableHeight>
          {({ width }) => (
            <div ref={registerChild}>
              <List
                ref={virtualizedListRef}
                autoHeight
                width={width}
                height={height}
                rowRenderer={rowRenderer}
                rowCount={rowCount}
                rowHeight={measurerCache.rowHeight}
                scrollTop={scrollTop}
                // By default, react-virtualized's list has the css property `will-change` set to `transform`
                // An element with `position: fixed` beneath an element with `will-change: transform` will
                // be incredibly busted. You can read more about that [here](https://stackoverflow.com/questions/28157125/why-does-transform-break-position-fixed)
                //
                // Simply setting this back to it's original `auto` seems to do the trick and shouldn't have
                // any serious performance implications from some trivial testing that was done.
                style={{ willChange: 'auto' }}
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
