import styled from 'styled-components';

import { ForwardedRef, forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import EmptyGallery from './EmptyGallery';
import UserGalleryCollection from './UserGalleryCollection';
import { DisplayLayout } from 'components/core/enums';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { UserGalleryCollectionsFragment$key } from '__generated__/UserGalleryCollectionsFragment.graphql';
import { useLoggedInUserId } from 'hooks/useLoggedInUserId';
import { UserGalleryCollectionsQueryFragment$key } from '__generated__/UserGalleryCollectionsQueryFragment.graphql';
import { removeNullValues } from 'utils/removeNullValues';
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  List,
  ListRowProps,
  WindowScroller,
} from 'react-virtualized';
import breakpoints from 'components/core/breakpoints';
import useWindowSize from 'hooks/useWindowSize';

type Props = {
  galleryRef: UserGalleryCollectionsFragment$key;
  queryRef: UserGalleryCollectionsQueryFragment$key;
  mobileLayout: DisplayLayout;
};

function UserGalleryCollections(
  { galleryRef, queryRef, mobileLayout }: Props,
  ref: ForwardedRef<List>
) {
  const query = useFragment(
    graphql`
      fragment UserGalleryCollectionsQueryFragment on Query {
        ...useLoggedInUserIdFragment
        ...UserGalleryCollectionQueryFragment
      }
    `,
    queryRef
  );

  const loggedInUserId = useLoggedInUserId(query);

  const { collections, owner } = useFragment(
    graphql`
      fragment UserGalleryCollectionsFragment on Gallery {
        owner {
          id
        }
        collections {
          id
          hidden
          tokens {
            __typename
            id
          }
          layout {
            sectionLayout {
              whitespace
            }
          }
          ...UserGalleryCollectionFragment
        }
      }
    `,
    galleryRef
  );

  const isAuthenticatedUsersPage = loggedInUserId === owner?.id;

  const nonNullCollections = removeNullValues(collections);

  const [cache] = useState(
    () =>
      new CellMeasurerCache({
        fixedWidth: true,
        minHeight: 100,
      })
  );

  const listRef = useRef<List>(null);
  const { width } = useWindowSize();

  // If the mobileLayout is changed, we need to recalculate the cache height.
  useEffect(() => {
    cache.clearAll();
    listRef.current?.recomputeRowHeights();
  }, [cache, mobileLayout, width]);

  const collectionsToDisplay = useMemo(
    () =>
      nonNullCollections.filter((collection) => {
        const isNotHidden = !collection.hidden;
        const hasTokens = collection.tokens?.length;
        const hasWhitespace = collection.layout?.sectionLayout?.find(
          (layout) => !!layout?.whitespace?.length
        );

        return (hasTokens || hasWhitespace) && isNotHidden;
      }),
    [nonNullCollections]
  );

  const handleLayoutShift = useCallback(
    (index: number) => {
      cache.clear(index, 0);
      listRef.current?.recomputeRowHeights(index);
    },
    [cache]
  );

  const rowRenderer = useCallback(
    ({ index, key, parent, style }: ListRowProps) => {
      const collection = collectionsToDisplay[index];
      return (
        <CellMeasurer cache={cache} columnIndex={0} rowIndex={index} key={key} parent={parent}>
          {({ registerChild, measure }) => {
            return (
              // @ts-expect-error Bad types from react-virtualized
              <StyledUserGalleryCollectionContainer ref={registerChild} key={key} style={style}>
                <UserGalleryCollection
                  onLayoutShift={() => handleLayoutShift(index)}
                  queryRef={query}
                  collectionRef={collection}
                  mobileLayout={mobileLayout}
                  cacheHeight={cache.getHeight(index, 0)}
                  onLoad={measure}
                />
              </StyledUserGalleryCollectionContainer>
            );
          }}
        </CellMeasurer>
      );
    },
    [cache, collectionsToDisplay, handleLayoutShift, mobileLayout, query]
  );

  const numCollectionsToDisplay = collectionsToDisplay.length;

  if (numCollectionsToDisplay === 0) {
    const emptyGalleryMessage = isAuthenticatedUsersPage
      ? 'Your gallery is empty. Display your NFTs by creating a collection.'
      : 'Curation in progress.';

    return <EmptyGallery message={emptyGalleryMessage} />;
  }

  return (
    <StyledUserGalleryCollections>
      <WindowScroller>
        {({ height, registerChild, scrollTop, onChildScroll }) => (
          <AutoSizer disableHeight>
            {({ width }) => (
              <div ref={registerChild}>
                <List
                  ref={(list) => {
                    if (list) {
                      listRef.current = list;

                      if (typeof ref === 'function') {
                        ref(list);
                      } else if (ref) {
                        ref.current = list;
                      }
                    }
                  }}
                  autoHeight
                  width={width}
                  height={height}
                  onScroll={onChildScroll}
                  rowHeight={cache.rowHeight}
                  rowCount={numCollectionsToDisplay}
                  scrollTop={scrollTop}
                  deferredMeasurementCache={cache}
                  rowRenderer={rowRenderer}
                  style={{
                    outline: 'none',
                  }}
                  overscanIndicesGetter={({
                    cellCount,
                    overscanCellsCount,
                    startIndex,
                    stopIndex,
                  }) => ({
                    overscanStartIndex: Math.max(0, startIndex - overscanCellsCount),
                    overscanStopIndex: Math.min(cellCount - 1, stopIndex + overscanCellsCount),
                  })}
                />
              </div>
            )}
          </AutoSizer>
        )}
      </WindowScroller>
    </StyledUserGalleryCollections>
  );
}

const StyledUserGalleryCollections = styled.div`
  width: 100%;
  padding-top: 16px;

  @media only screen and ${breakpoints.tablet} {
    padding-top: 80px;
  }
`;

const StyledUserGalleryCollectionContainer = styled.div`
  padding-bottom: 48px;
`;

export default forwardRef<List, Props>(UserGalleryCollections);
