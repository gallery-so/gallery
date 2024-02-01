import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { graphql, usePaginationFragment } from 'react-relay';
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  InfiniteLoader,
  List,
  ListRowRenderer,
  WindowScroller,
} from 'react-virtualized';
import styled from 'styled-components';

import { BookmarkedTokenGridFragment$key } from '~/generated/BookmarkedTokenGridFragment.graphql';
import useWindowSize, { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import BookmarkIcon from '~/icons/BookmarkIcon';
import { BOOKMARKS_PER_PAGE } from '~/pages/[username]/bookmarks';

import breakpoints from '../core/breakpoints';
import { HStack, VStack } from '../core/Spacer/Stack';
import { TitleDiatypeM } from '../core/Text/Text';
import BookmarkedTokenGridItem from './BookmarkedTokenGridItem';

const ITEMS_PER_ROW_MOBILE = 2;
const ITEMS_PER_ROW_DESKTOP = 4;

type Props = {
  userRef: BookmarkedTokenGridFragment$key;
};

export default function BookmarkedTokenGrid({ userRef }: Props) {
  // const query = useFragment(
  //   graphql`
  //     fragment BookmarkedTokenGridQueryFragment on Query {}
  //       `,
  //   queryRef
  // );

  const { data, loadNext, hasNext } = usePaginationFragment(
    graphql`
      fragment BookmarkedTokenGridFragment on GalleryUser
      @refetchable(queryName: "RefetchableBookmarkedTokenGridFragment") {
        tokensBookmarked(first: $bookmarksFirst, after: $bookmarksAfter)
          @connection(key: "BookmarkedTokenGridFragment_tokensBookmarked") {
          edges {
            node {
              __typename
              id
              ...BookmarkedTokenGridItemFragment
            }
          }
        }
      }
    `,
    userRef
  );

  const bookmarkedTokens = useMemo(() => {
    const tokens = [];

    for (const token of data.tokensBookmarked?.edges ?? []) {
      if (token?.node) {
        tokens.push(token.node);
      }
    }

    return tokens;
  }, [data.tokensBookmarked?.edges]);

  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  // group tokens into rows so they can be virtualized
  const groupedTokens = useMemo(() => {
    const itemsPerRow = isMobile ? ITEMS_PER_ROW_MOBILE : ITEMS_PER_ROW_DESKTOP;
    const result = [];
    for (let i = 0; i < bookmarkedTokens.length; i += itemsPerRow) {
      const row = bookmarkedTokens.slice(i, i + itemsPerRow);
      result.push(row);
    }
    return result;
  }, [bookmarkedTokens, isMobile]);

  const [measurerCache] = useState(
    () =>
      new CellMeasurerCache({
        fixedWidth: true,
        minHeight: 100,
      })
  );
  const rowRenderer = useCallback<ListRowRenderer>(
    ({ index, key, parent, style }) => {
      if (!groupedTokens[index]) {
        return null;
      }
      return (
        <CellMeasurer
          cache={measurerCache}
          columnIndex={0}
          rowIndex={index}
          key={key}
          parent={parent}
        >
          {({ registerChild, measure }) => (
            // @ts-expect-error Bad types from react-virtualized
            <StyledGridRow ref={registerChild} key={key} style={style}>
              {groupedTokens[index].map((token) => (
                <BookmarkedTokenGridItem key={token.id} tokenRef={token} onNftLoad={measure} />
              ))}
            </StyledGridRow>
          )}
        </CellMeasurer>
      );
    },
    [groupedTokens, measurerCache]
  );

  const isRowLoaded = useCallback(
    ({ index }: { index: number }) => !hasNext || Boolean(groupedTokens[index]),
    [groupedTokens, hasNext]
  );

  const gridRef = useRef<List>(null);
  const { width } = useWindowSize();
  // If the width is changed, we need to recalculate the cache height.
  useEffect(() => {
    measurerCache.clearAll();
    gridRef.current?.recomputeRowHeights();
  }, [measurerCache, width]);

  const handleLoadMore = useCallback(async () => {
    loadNext(BOOKMARKS_PER_PAGE);
  }, [loadNext]);

  const rowCount = hasNext ? groupedTokens.length + 1 : groupedTokens.length;

  return (
    <StyledContainer>
      <HStack gap={4} align="center">
        <StyledTitle>Bookmarks</StyledTitle>
        <BookmarkIcon colorScheme="black" isActive={true} width={16} />
      </HStack>

      <WindowScroller>
        {({ height, registerChild, scrollTop }) => (
          <AutoSizer disableHeight>
            {({ width }) => (
              // @ts-expect-error bad react-virtualized types
              <div ref={registerChild}>
                <InfiniteLoader
                  isRowLoaded={isRowLoaded}
                  loadMoreRows={handleLoadMore}
                  rowCount={rowCount}
                >
                  {({ onRowsRendered, registerChild }) => (
                    <div ref={(el) => registerChild(el)}>
                      <List
                        ref={gridRef}
                        autoHeight
                        width={width}
                        height={height}
                        rowRenderer={rowRenderer}
                        rowCount={groupedTokens.length}
                        rowHeight={measurerCache.rowHeight}
                        onRowsRendered={onRowsRendered}
                        scrollTop={scrollTop}
                      />
                    </div>
                  )}
                </InfiniteLoader>
              </div>
            )}
          </AutoSizer>
        )}
      </WindowScroller>
    </StyledContainer>
  );
}

const StyledContainer = styled(VStack)`
  width: 100%;
`;

const StyledTitle = styled(TitleDiatypeM)`
  font-size: 16px;
  line-height: 20px;
`;

const StyledGridRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding-bottom: 24px;

  @media only screen and ${breakpoints.tablet} {
    grid-template-columns: repeat(4, 1fr);
  }
`;
