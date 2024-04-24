import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFragment } from 'react-relay';
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  List,
  ListRowProps,
  WindowScroller,
} from 'react-virtualized';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { DisplayLayout } from '~/components/core/enums';
import { MultiShimmerProvider } from '~/contexts/shimmer/ShimmerContext';
import { UserGalleryCollectionsFragment$key } from '~/generated/UserGalleryCollectionsFragment.graphql';
import { UserGalleryCollectionsQueryFragment$key } from '~/generated/UserGalleryCollectionsQueryFragment.graphql';
import useWindowSize from '~/hooks/useWindowSize';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import { useLoggedInUserId } from '~/shared/relay/useLoggedInUserId';

import EmptyGallery, { EmptyAuthenticatedUsersGallery } from './EmptyGallery';
import UserGalleryCollection from './UserGalleryCollection';

type Props = {
  galleryRef: UserGalleryCollectionsFragment$key;
  queryRef: UserGalleryCollectionsQueryFragment$key;
  mobileLayout: DisplayLayout;
};

function UserGalleryCollections({ galleryRef, queryRef, mobileLayout }: Props) {
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

  const {
    dbid: galleryId,
    collections,
    owner,
  } = useFragment(
    graphql`
      fragment UserGalleryCollectionsFragment on Gallery {
        dbid
        owner {
          id
        }
        collections {
          id
          hidden
          tokens {
            __typename
            id
            token {
              dbid
            }
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

  const tokenIds = collections?.reduce((acc, collection) => {
    const ids =
      collection?.tokens
        ?.map((token) => token?.token?.dbid)
        .filter((id): id is string => id !== undefined) || [];
    return acc.concat(ids);
  }, [] as string[]);

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
        const hasWhitespace = collection.layout?.sectionLayout?.find((layout) =>
          Boolean(layout?.whitespace?.length)
        );

        return (hasTokens || hasWhitespace) && isNotHidden;
      }),
    [nonNullCollections]
  );

  const rowRenderer = useCallback(
    ({ index, key, parent, style }: ListRowProps) => {
      const collection = collectionsToDisplay[index];

      if (!collection) {
        return null;
      }

      return (
        <CellMeasurer cache={cache} columnIndex={0} rowIndex={index} key={key} parent={parent}>
          {({ registerChild, measure }) => {
            return (
              // @ts-expect-error Bad types from react-virtualized
              <StyledUserGalleryCollectionContainer ref={registerChild} key={key} style={style}>
                <UserGalleryCollection
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
    [cache, collectionsToDisplay, mobileLayout, query]
  );

  const numCollectionsToDisplay = collectionsToDisplay.length;

  if (numCollectionsToDisplay === 0) {
    return isAuthenticatedUsersPage ? (
      <EmptyAuthenticatedUsersGallery galleryId={galleryId} />
    ) : (
      <EmptyGallery message="Curation in progress." />
    );
  }

  return (
    <MultiShimmerProvider tokenIdsToLoad={tokenIds ? tokenIds?.slice(0, 12) : []}>
      <StyledUserGalleryCollections>
        <WindowScroller>
          {({ height, registerChild, scrollTop, onChildScroll }) => (
            <AutoSizer disableHeight>
              {({ width }) => (
                // @ts-expect-error shitty react-virtualized types
                <div ref={registerChild}>
                  <List
                    ref={listRef}
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
                      overflowX: 'visible',
                      overflowY: 'visible',
                    }}
                    containerStyle={{ overflow: 'visible' }}
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
    </MultiShimmerProvider>
  );
}

const StyledUserGalleryCollections = styled.div`
      width: 100%;

      padding-top: 16px;

      @media only screen and ${breakpoints.tablet} {
        padding-top: 24px;
  }
      `;

const StyledUserGalleryCollectionContainer = styled.div`
  padding-bottom: 48px;
`;

export default UserGalleryCollections;
