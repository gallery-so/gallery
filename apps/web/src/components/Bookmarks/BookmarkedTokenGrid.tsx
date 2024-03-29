import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { graphql, useFragment, usePaginationFragment } from 'react-relay';
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  InfiniteLoader,
  List,
  ListRowRenderer,
  WindowScroller,
} from 'react-virtualized';
import { contexts } from 'shared/analytics/constants';
import colors from 'shared/theme/colors';
import styled from 'styled-components';

import { BookmarkedTokenGridFragment$key } from '~/generated/BookmarkedTokenGridFragment.graphql';
import { BookmarkedTokenGridQueryFragment$key } from '~/generated/BookmarkedTokenGridQueryFragment.graphql';
import useWindowSize, { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import BookmarkIcon from '~/icons/BookmarkIcon';
import { BOOKMARKS_PER_PAGE } from '~/pages/[username]/bookmarks';

import breakpoints from '../core/breakpoints';
import { Button } from '../core/Button/Button';
import GalleryLink from '../core/GalleryLink/GalleryLink';
import { HStack, VStack } from '../core/Spacer/Stack';
import { TitleDiatypeM, TitleM, TitleXS } from '../core/Text/Text';
import BookmarkedTokenGridItem from './BookmarkedTokenGridItem';

const ITEMS_PER_ROW_MOBILE = 2;
const ITEMS_PER_ROW_DESKTOP = 4;

type Props = {
  queryRef: BookmarkedTokenGridQueryFragment$key;
  userRef: BookmarkedTokenGridFragment$key;
};

export default function BookmarkedTokenGrid({ queryRef, userRef }: Props) {
  const query = useFragment(
    graphql`
      fragment BookmarkedTokenGridQueryFragment on Query {
        ...BookmarkedTokenGridItemQueryFragment
      }
    `,
    queryRef
  );
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
              {/* adding non-null assertion after groupedTokens[index] because we check if it's defined above, but typescript doesnt recognize the check*/}
              {groupedTokens[index]!.map((token) => (
                <BookmarkedTokenGridItem
                  queryRef={query}
                  key={token.id}
                  tokenRef={token}
                  onNftLoad={measure}
                />
              ))}
            </StyledGridRow>
          )}
        </CellMeasurer>
      );
    },
    [groupedTokens, measurerCache, query]
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
    <StyledContainer gap={24}>
      <HStack gap={4} align="center">
        <StyledTitle>Bookmarks</StyledTitle>
        <BookmarkIcon colorScheme="black" isActive={true} width={16} />
      </HStack>

      {bookmarkedTokens.length ? (
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
      ) : (
        <StyledEmptyState gap={32} align="center">
          <VStack align="center">
            <TitleM>
              <strong>
                You haven’t Bookmarked anything yet!{!isMobile && <br />} Tap the Bookmark icon on
                work you like to build your collection
              </strong>
            </TitleM>
          </VStack>
          <StyledEmptyStateCtaWrapper to={{ pathname: '/home' }}>
            <StyledEmptyStateCtaButton
              eventElementId="Bookmarks Tab Empty State Start Exploring Button"
              eventName="Clicked Bookmarks Tab Empty State Start Exploring Button"
              eventContext={contexts.Bookmarks}
            >
              <TitleXS color={colors.white}>Start Exploring</TitleXS>
            </StyledEmptyStateCtaButton>
          </StyledEmptyStateCtaWrapper>
        </StyledEmptyState>
      )}
    </StyledContainer>
  );
}

const StyledContainer = styled(VStack)`
  padding-top: 24px;
  width: 100%;

  @media only screen and ${breakpoints.tablet} {
    padding-top: 0;
  }
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

const StyledEmptyState = styled(VStack)`
  padding: 76px 24px 0;
  text-align: center;

  @media only screen and ${breakpoints.tablet} {
    padding: 0;
  }
`;

const StyledEmptyStateCtaWrapper = styled(GalleryLink)`
  width: 100%;
  @media only screen and ${breakpoints.tablet} {
    width: initial;
  }
`;

const StyledEmptyStateCtaButton = styled(Button)`
  width: 100%;
  @media only screen and ${breakpoints.tablet} {
    width: initial;
  }
`;
