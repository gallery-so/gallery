import { useCallback, useMemo } from 'react';
import { graphql, useFragment, usePaginationFragment } from 'react-relay';
import {
  AutoSizer,
  CellRenderer,
  Grid,
  GridCellRenderer,
  InfiniteLoader,
  List,
  ListRowRenderer,
  WindowScroller,
} from 'react-virtualized';
import styled from 'styled-components';

import { HStack, VStack } from '../core/Spacer/Stack';
import { TitleDiatypeM } from '../core/Text/Text';
import BookmarkedTokenGridItem from './BookmarkedTokenGridItem';
// import List from '../core/Markdown/List';

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

  console.log(data);

  const bookmarkedTokens = useMemo(() => {
    const tokens = [];

    for (const token of data.tokensBookmarked?.edges ?? []) {
      if (token?.node) {
        tokens.push(token.node);
      }
    }

    return tokens;
  }, [data.tokensBookmarked?.edges]);

  // group tokens into rows so they can be virtualized
  const groupedTokens = useMemo(() => {
    const itemsPerRow = 4;
    const result = [];
    for (let i = 0; i < bookmarkedTokens.length; i += itemsPerRow) {
      const row = bookmarkedTokens.slice(i, i + itemsPerRow);
      result.push(row);
    }
    return result;
  }, [bookmarkedTokens]);

  console.log({ groupedTokens });

  const rowRenderer = useCallback<ListRowRenderer>(
    ({ index, key, style }) => {
      console.log(groupedTokens[index]);
      if (!groupedTokens[index]) {
        return null;
      }
      return (
        <StyledGridRow key={key} style={style}>
          {groupedTokens[index].map((token) => (
            <BookmarkedTokenGridItem key={token.id} tokenRef={token} />
          ))}
        </StyledGridRow>
      );
    },
    [groupedTokens]
  );

  const isRowLoaded = useCallback(
    ({ index }: { index: number }) => !hasNext || index < groupedTokens.length - 1,
    [groupedTokens, hasNext]
  );

  console.log({ hasNext }, isRowLoaded);

  const handleLoadMore = useCallback(async () => {
    // setIsLoading(true);
    console.log('load more');
    await loadNext(12);
    // setIsLoading(false);
  }, [loadNext]);

  const rowCount = hasNext ? groupedTokens.length + 1 : groupedTokens.length;

  return (
    <StyledContainer>
      <StyledTitle>Bookmarks</StyledTitle>
      {/* {bookmarkedTokens.map((token) => (
        <BookmarkedTokenGridItem key={token.id} tokenRef={token} />
      ))} */}
      <WindowScroller>
        {({ height, registerChild, scrollTop }) => (
          <AutoSizer disableHeight>
            {({ width }) => (
              <div ref={registerChild}>
                <InfiniteLoader
                  isRowLoaded={isRowLoaded}
                  loadMoreRows={handleLoadMore}
                  rowCount={rowCount}
                >
                  {({ onRowsRendered, registerChild }) => (
                    <div ref={(el) => registerChild(el)}>
                      <List
                        autoHeight
                        width={width}
                        height={height}
                        rowHeight={300}
                        rowCount={groupedTokens.length}
                        // rowHeight={measurerCache.rowHeight}
                        rowRenderer={rowRenderer}
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
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
`;
