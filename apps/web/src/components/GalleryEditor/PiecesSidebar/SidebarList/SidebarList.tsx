import throttle from 'lodash.throttle';
import { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import { graphql } from 'react-relay';
import { AutoSizer, Index, List, ListRowProps } from 'react-virtualized';
import { readInlineData } from 'relay-runtime';
import styled from 'styled-components';

import SidebarNftIcon from '~/components/GalleryEditor/PiecesSidebar/SidebarNftIcon';
import {
  SIDEBAR_COLLECTION_TITLE_BOTTOM_SPACE,
  SIDEBAR_COLLECTION_TITLE_HEIGHT,
  SIDEBAR_ICON_DIMENSIONS,
  SIDEBAR_ICON_GAP,
} from '~/constants/sidebar';
import { SidebarListTokenFragment$key } from '~/generated/SidebarListTokenFragment.graphql';

import { TokenFilterType } from '../SidebarViewSelector';
import CollectionTitle from './CollectionTitle';
import { SetSpamFn } from './ToggleSpamIcon';

export type CollectionTitleRow = {
  type: 'collection-title';
  expanded: boolean;
  address: string;
  title: string;
  count: number;
};

export type VirtualizedRow =
  | CollectionTitleRow
  | { type: 'tokens'; tokens: SidebarListTokenFragment$key[]; expanded: boolean };

type Props = {
  rows: VirtualizedRow[];
  selectedView: TokenFilterType;
  shouldUseCollectionGrouping: boolean;
  onToggleExpanded(address: string): void;
  handleTokenRenderError: (id: string) => void;
  handleTokenRenderSuccess: (id: string) => void;
  setSpamPreferenceForCollection: SetSpamFn;
};

export function SidebarList({
  rows,
  selectedView,
  onToggleExpanded,
  handleTokenRenderError,
  handleTokenRenderSuccess,
  shouldUseCollectionGrouping,
  setSpamPreferenceForCollection,
}: Props) {
  const rowRenderer = useCallback(
    ({ key, style, index }: ListRowProps) => {
      const row = rows[index];

      if (!row) {
        return null;
      }

      if (row.type === 'collection-title') {
        return (
          <CollectionTitle
            row={row}
            key={key}
            style={style}
            index={index}
            selectedView={selectedView}
            onToggleExpanded={onToggleExpanded}
            setSpamPreferenceForCollection={setSpamPreferenceForCollection}
          />
        );
      }

      if (row.type === 'tokens') {
        if (!row.expanded) {
          return null;
        }

        return (
          <Selection key={key} style={style}>
            {row.tokens.map((tokenRef) => {
              const token = readInlineData(
                graphql`
                  fragment SidebarListTokenFragment on Token @inline {
                    dbid
                    ...SidebarNftIconFragment
                  }
                `,
                tokenRef
              );

              return (
                <SidebarNftIcon
                  key={token.dbid}
                  tokenRef={token}
                  handleTokenRenderError={handleTokenRenderError}
                  handleTokenRenderSuccess={handleTokenRenderSuccess}
                />
              );
            })}
          </Selection>
        );
      }
    },
    [
      handleTokenRenderError,
      handleTokenRenderSuccess,
      onToggleExpanded,
      rows,
      selectedView,
      setSpamPreferenceForCollection,
    ]
  );

  const rowHeightCalculator = useCallback(
    ({ index }: Index) => {
      const row = rows[index];

      if (row?.type === 'tokens') {
        if (!row.expanded) {
          return 0;
        }

        return SIDEBAR_ICON_DIMENSIONS + SIDEBAR_ICON_GAP;
      } else if (row?.type === 'collection-title') {
        if (row.expanded) {
          return SIDEBAR_COLLECTION_TITLE_HEIGHT + SIDEBAR_COLLECTION_TITLE_BOTTOM_SPACE;
        } else {
          return SIDEBAR_COLLECTION_TITLE_HEIGHT;
        }
      }

      // Maybe we should report an error here
      return 0;
    },
    [rows]
  );

  const virtualizedListRef = useRef<List | null>(null);

  /**
   * We have to use a throttled version here due to the following:
   *
   * If a user has a bunch of broken NFTs, the parent component
   * will re-render a bunch of times while those NFTs progressively fail.
   *
   * Each re-render causes the "rows" to change, causing this effect
   * to fire too many times. If we don't throttle, React thinks
   * we're in an infinite loop and throws an error.
   *
   * We're using throttle not debounce here since we want
   * to recompute the row heights as soon as possible to
   * avoid any weird layout flickering while searching.
   */
  const throttledRecomputeRowHeights = useMemo(() => {
    return throttle(
      () => {
        virtualizedListRef.current?.recomputeRowHeights();
      },
      200,
      { leading: true, trailing: true }
    );
  }, []);

  // Important to useLayoutEffect to avoid flashing of the
  // React Virtualized component.
  useLayoutEffect(() => {
    throttledRecomputeRowHeights();
  }, [rows, throttledRecomputeRowHeights]);

  return (
    <StyledListTokenContainer shouldUseCollectionGrouping={shouldUseCollectionGrouping}>
      <AutoSizer>
        {({ width, height }) => (
          <List
            className="SidebarTokenList"
            ref={virtualizedListRef}
            style={{ outline: 'none', padding: '0 4px' }}
            rowRenderer={rowRenderer}
            rowCount={rows.length}
            rowHeight={rowHeightCalculator}
            width={width}
            height={height}
          />
        )}
      </AutoSizer>
    </StyledListTokenContainer>
  );
}

const StyledListTokenContainer = styled.div<{ shouldUseCollectionGrouping: boolean }>`
  flex-grow: 1;

  // Need this since typically the CollectionTitle is responsible for the spacing between
  // the SidebarChainSelector and the SidebarList component
  margin-top: ${({ shouldUseCollectionGrouping }) => (shouldUseCollectionGrouping ? '0' : '12px')};
`;

const Selection = styled.div`
  padding: 0 12px;
  display: flex;
  grid-gap: ${SIDEBAR_ICON_GAP}px;
`;
