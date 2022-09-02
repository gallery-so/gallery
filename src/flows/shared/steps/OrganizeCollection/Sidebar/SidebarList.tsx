import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AutoSizer, Index, List, ListRowProps } from 'react-virtualized';
import { EditModeToken } from 'flows/shared/steps/OrganizeCollection/types';
import { ExpandedIcon } from 'flows/shared/steps/OrganizeCollection/Sidebar/ExpandedIcon';
import SidebarNftIcon from 'flows/shared/steps/OrganizeCollection/Sidebar/SidebarNftIcon';
import {
  SIDEBAR_COLLECTION_TITLE_BOTTOM_SPACE,
  SIDEBAR_COLLECTION_TITLE_HEIGHT,
  SIDEBAR_ICON_DIMENSIONS,
  SIDEBAR_ICON_GAP,
} from 'constants/sidebar';
import styled from 'styled-components';
import { TitleXS } from 'components/core/Text/Text';
import { readInlineData } from 'relay-runtime';
import { graphql } from 'react-relay';
import { SidebarListTokenFragment$key } from '../../../../../../__generated__/SidebarListTokenFragment.graphql';
import Tooltip from 'components/Tooltip/Tooltip';

export type TokenAndEditModeToken = {
  token: SidebarListTokenFragment$key;
  editModeToken: EditModeToken;
};

export type VirtualizedRow =
  | { type: 'collection-title'; expanded: boolean; address: string; title: string }
  | { type: 'tokens'; tokens: TokenAndEditModeToken[]; expanded: boolean };

type Props = {
  rows: VirtualizedRow[];
  shouldUseCollectionGrouping: boolean;
  onToggleExpanded(address: string): void;
  handleTokenRenderError: (id: string) => void;
  handleTokenRenderSuccess: (id: string) => void;
};

export function SidebarList({
  rows,
  onToggleExpanded,
  handleTokenRenderError,
  handleTokenRenderSuccess,
  shouldUseCollectionGrouping,
}: Props) {
  const rowRenderer = useCallback(
    ({ key, style, index }: ListRowProps) => {
      const row = rows[index];

      if (!row) {
        return null;
      }

      if (row.type === 'collection-title') {
        return (
          <CollectionTitleContainer
            expanded={row.expanded}
            onClick={() => onToggleExpanded(row.address)}
            key={key}
            style={style}
          >
            <ExpandedIcon expanded={row.expanded} />

            <CollectionTitleText title={row.title}>{row.title}</CollectionTitleText>
          </CollectionTitleContainer>
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
                  fragment SidebarListTokenFragment on Token @inline {
                    dbid
                    ...SidebarNftIconFragment
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
    [handleTokenRenderError, handleTokenRenderSuccess, onToggleExpanded, rows]
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
  // Important to useLayoutEffect to avoid flashing of the
  // React Virtualized component.
  useLayoutEffect(
    function recomputeRowHeightsWhenCollectionExpanded() {
      virtualizedListRef.current?.recomputeRowHeights();
    },
    [rows]
  );

  return (
    <StyledListTokenContainer shouldUseCollectionGrouping={shouldUseCollectionGrouping}>
      <AutoSizer>
        {({ width, height }) => (
          <List
            className="SidebarTokenList"
            ref={virtualizedListRef}
            style={{ outline: 'none' }}
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

const CollectionTitleContainer = styled.div.attrs({ role: 'button' })<{ expanded: boolean }>`
  display: flex;
  align-items: center;

  cursor: pointer;

  padding-bottom: ${({ expanded }) =>
    expanded ? `${SIDEBAR_COLLECTION_TITLE_BOTTOM_SPACE}px` : '0px'};
`;

const StyledListTokenContainer = styled.div<{ shouldUseCollectionGrouping: boolean }>`
  width: 100%;
  flex-grow: 1;

  // Need this since typically the CollectionTitle is responsible for the spacing between
  // the SidebarChainSelector and the SidebarList component
  margin-top: ${({ shouldUseCollectionGrouping }) => (shouldUseCollectionGrouping ? '0' : '12px')};
`;

const Selection = styled.div`
  display: flex;
  grid-gap: ${SIDEBAR_ICON_GAP}px;
`;
