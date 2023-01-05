import throttle from 'lodash.throttle';
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { graphql } from 'react-relay';
import { AutoSizer, Index, List, ListRowProps } from 'react-virtualized';
import { readInlineData } from 'relay-runtime';
import styled from 'styled-components';

import colors from '~/components/core/colors';
import IconContainer from '~/components/core/Markdown/IconContainer';
import { TitleXS } from '~/components/core/Text/Text';
import { EditModeToken } from '~/components/GalleryEditor/CollectionEditor/types';
import { ExpandedIcon } from '~/components/GalleryEditor/PiecesSidebar/ExpandedIcon';
import SidebarNftIcon from '~/components/GalleryEditor/PiecesSidebar/SidebarNftIcon';
import Tooltip from '~/components/Tooltip/Tooltip';
import {
  SIDEBAR_COLLECTION_TITLE_BOTTOM_SPACE,
  SIDEBAR_COLLECTION_TITLE_HEIGHT,
  SIDEBAR_ICON_DIMENSIONS,
  SIDEBAR_ICON_GAP,
} from '~/constants/sidebar';
import { SidebarListTokenNewFragment$key } from '~/generated/SidebarListTokenNewFragment.graphql';
import HideIcon from '~/icons/HideIcon';
import ShowIcon from '~/icons/ShowIcon';

import { SidebarView } from './SidebarViewSelector';

export type TokenAndEditModeToken = {
  token: SidebarListTokenNewFragment$key;
  editModeToken: EditModeToken;
};

export type CollectionTitleRow = {
  type: 'collection-title';
  expanded: boolean;
  address: string;
  title: string;
};

export type VirtualizedRow =
  | CollectionTitleRow
  | { type: 'tokens'; tokens: TokenAndEditModeToken[]; expanded: boolean };

type Props = {
  rows: VirtualizedRow[];
  selectedView: SidebarView;
  shouldUseCollectionGrouping: boolean;
  onToggleExpanded(address: string): void;
  handleTokenRenderError: (id: string) => void;
  handleTokenRenderSuccess: (id: string) => void;
  setSpamPreferenceForCollection: (address: string, isSpam: boolean) => void;
};

function CollectionTitle({
  row,
  key,
  style,
  selectedView,
  onToggleExpanded,
  setSpamPreferenceForCollection,
}: {
  row: CollectionTitleRow;
  key: string;
  style: React.CSSProperties;
  selectedView: SidebarView;
  onToggleExpanded: (address: string) => void;
  setSpamPreferenceForCollection: (address: string, isSpam: boolean) => void;
}) {
  const [showIcon, setShowIcon] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <CollectionTitleRow style={style}>
      <CollectionTitleContainer
        onClick={() => onToggleExpanded(row.address)}
        key={key}
        onMouseEnter={() => setShowIcon(true)}
        onMouseLeave={() => setShowIcon(false)}
      >
        <ExpandedIcon expanded={row.expanded} />

        <CollectionTitleText title={row.title}>{row.title}</CollectionTitleText>

        {showIcon && (
          <>
            <ShowHideContainer
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={(e) => {
                e.stopPropagation();
                setSpamPreferenceForCollection(row.address, selectedView === 'Collected');
              }}
            >
              <IconContainer
                stacked
                size="sm"
                icon={selectedView === 'Hidden' ? <ShowIcon /> : <HideIcon />}
              />
            </ShowHideContainer>
            <StyledTooltip
              text={selectedView === 'Hidden' ? 'Show' : 'Hide'}
              description={`This will move "${row.title}" to your ${
                selectedView === 'Hidden' ? 'Collected' : 'Hidden'
              } folder.`}
              whiteSpace="normal"
              visible={showTooltip}
            />
          </>
        )}
      </CollectionTitleContainer>
    </CollectionTitleRow>
  );
}

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
            {row.tokens.map((tokenOrWhitespace) => {
              const token = readInlineData(
                graphql`
                  fragment SidebarListTokenNewFragment on Token @inline {
                    dbid
                    ...SidebarNftIconNewFragment
                  }
                `,
                tokenOrWhitespace.token
              );

              return (
                <SidebarNftIcon
                  key={token.dbid}
                  tokenRef={token}
                  editModeToken={tokenOrWhitespace.editModeToken}
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

const CollectionTitleText = styled(TitleXS)`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const CollectionTitleRow = styled.div`
  padding-bottom: ${SIDEBAR_COLLECTION_TITLE_BOTTOM_SPACE}px;
`;

const CollectionTitleContainer = styled.div.attrs({ role: 'button' })`
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;

  height: ${SIDEBAR_COLLECTION_TITLE_HEIGHT}px;
  padding: 0 8px;

  border-radius: 2px;

  &:hover {
    background: ${colors.faint};
  }
`;

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

const ShowHideContainer = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;
`;

const StyledTooltip = styled(Tooltip)<{ visible: boolean }>`
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  width: 130px;
  right: 0;
  top: 30px;
  z-index: 1;
`;
