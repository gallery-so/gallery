import styled from 'styled-components';
import Spacer from 'components/core/Spacer/Spacer';

import { useCallback, useMemo, useRef } from 'react';
import EmptyGallery from './EmptyGallery';
import UserGalleryCollection from './UserGalleryCollection';
import { DisplayLayout } from 'components/core/enums';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { UserGalleryCollectionsFragment$key } from '__generated__/UserGalleryCollectionsFragment.graphql';
import { useLoggedInUserId } from 'hooks/useLoggedInUserId';
import { UserGalleryCollectionsQueryFragment$key } from '__generated__/UserGalleryCollectionsQueryFragment.graphql';
import { removeNullValues } from 'utils/removeNullValues';
import { useIsMobileWindowWidth } from 'hooks/useWindowSize';
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  List,
  ListRowProps,
  WindowScroller,
} from 'react-virtualized';

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
            whitespace
          }
          ...UserGalleryCollectionFragment
        }
      }
    `,
    galleryRef
  );

  const isAuthenticatedUsersPage = loggedInUserId === owner?.id;

  const nonNullCollections = removeNullValues(collections);
  const isMobile = useIsMobileWindowWidth();

  const cache = useRef(
    new CellMeasurerCache({
      fixedWidth: true,
      minHeight: 100,
    })
  );

  const listRef = useRef<List>(null);

  const collectionsToDisplay = useMemo(
    () =>
      nonNullCollections.filter((collection) => {
        const isNotHidden = !collection.hidden;
        const hasTokens = collection.tokens?.length;
        const hasWhitespace = collection.layout?.whitespace?.length;
        return (hasTokens || hasWhitespace) && isNotHidden;
      }),
    [nonNullCollections]
  );

  const rowRenderer = useCallback(
    ({ index, key, parent, style }: ListRowProps) => {
      const collection = collectionsToDisplay[index];
      return (
        <CellMeasurer
          cache={cache.current}
          columnIndex={0}
          rowIndex={index}
          key={key}
          parent={parent}
        >
          {({ registerChild, measure }) => {
            return (
              // @ts-ignore
              <div ref={registerChild} key={key} style={style}>
                <UserGalleryCollection
                  queryRef={query}
                  collectionRef={collection}
                  mobileLayout={mobileLayout}
                  cacheHeight={cache.current.getHeight(index, 0)}
                  onLoad={measure}
                />
                <Spacer height={48} />
              </div>
            );
          }}
        </CellMeasurer>
      );
    },
    [collectionsToDisplay, mobileLayout, query]
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
      <Spacer height={isMobile ? 48 : 80} />
      <WindowScroller>
        {({ height, registerChild, scrollTop, onChildScroll }) => (
          <AutoSizer disableHeight>
            {({ width }) => (
              <div ref={registerChild}>
                <List
                  ref={listRef}
                  autoHeight
                  width={width}
                  height={height}
                  onScroll={onChildScroll}
                  rowHeight={cache.current.rowHeight}
                  rowCount={numCollectionsToDisplay}
                  scrollTop={scrollTop}
                  deferredMeasurementCache={cache.current}
                  rowRenderer={rowRenderer}
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
`;

export default UserGalleryCollections;
