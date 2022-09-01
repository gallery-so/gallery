import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';

import { TitleS, TitleXS } from 'components/core/Text/Text';
import { FOOTER_HEIGHT } from 'flows/shared/components/WizardFooter/WizardFooter';
import TextButton from 'components/core/Button/TextButton';
import { SidebarTokensState } from 'contexts/collectionEditor/CollectionEditorContext';
import { convertObjectToArray } from '../convertObjectToArray';
import SidebarNftIcon from './SidebarNftIcon';
import SearchBar from './SearchBar';
import { useWizardState } from 'contexts/wizard/WizardDataProvider';
import colors from 'components/core/colors';
import { graphql, useFragment } from 'react-relay';
import { SidebarFragment$key } from '__generated__/SidebarFragment.graphql';
import { removeNullValues } from 'utils/removeNullValues';
import useIs3ac from 'hooks/oneOffs/useIs3ac';
import { SidebarViewerFragment$key } from '__generated__/SidebarViewerFragment.graphql';
import { EditModeToken } from '../types';
import { AutoSizer, Index, List, ListRowProps } from 'react-virtualized';
import {
  SIDEBAR_COLLECTION_TITLE_BOTTOM_SPACE,
  SIDEBAR_COLLECTION_TITLE_HEIGHT,
  SIDEBAR_ICON_DIMENSIONS,
  SIDEBAR_ICON_GAP,
} from 'constants/sidebar';
import AddBlankBlock from './AddBlankBlock';
import keyBy from 'lodash.keyby';
import {
  Chain,
  SidebarChains,
} from 'flows/shared/steps/OrganizeCollection/Sidebar/SidebarChainSelector';
import {
  SidebarTokensFragment$data,
  SidebarTokensFragment$key,
} from '../../../../../../__generated__/SidebarTokensFragment.graphql';
import { ExpandedIcon } from 'flows/shared/steps/OrganizeCollection/Sidebar/ExpandedIcon';
import { groupCollectionsByAddress } from 'flows/shared/steps/OrganizeCollection/Sidebar/groupCollectionsByAddress';
import { createVirtualizedRows } from 'flows/shared/steps/OrganizeCollection/Sidebar/createVirtualizedRows';
import { useSet } from 'hooks/useSet';

type Props = {
  sidebarTokens: SidebarTokensState;
  tokensRef: SidebarFragment$key;
  viewerRef: SidebarViewerFragment$key;
};

function Sidebar({ tokensRef, sidebarTokens, viewerRef }: Props) {
  const allTokens = useFragment(
    graphql`
      fragment SidebarFragment on Token @relay(plural: true) {
        dbid
        chain

        ...SearchBarFragment
        ...SidebarTokensFragment
        ...getVideoOrImageUrlForNftPreviewFragment
      }
    `,
    tokensRef
  );

  const viewer = useFragment(
    graphql`
      fragment SidebarViewerFragment on Viewer {
        user {
          dbid
        }
      }
    `,
    viewerRef
  );

  const [searchResults, setSearchResults] = useState<string[]>([]);
  // TODO(Terence): Enable this when we enable POAP / Tezos
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedChain, setSelectedChain] = useState<Chain>('Ethereum');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  const is3ac = useIs3ac(viewer.user?.dbid);
  const nonNullTokens = removeNullValues(allTokens);

  const { isRefreshingNfts, handleRefreshNfts } = useWizardState();

  const sidebarTokensAsArray = useMemo(() => convertObjectToArray(sidebarTokens), [sidebarTokens]);

  const editModeTokensSearchResults = useMemo(() => {
    if (!debouncedSearchQuery) {
      return sidebarTokensAsArray;
    }

    const searchResultNfts = [];
    for (const resultId of searchResults) {
      if (sidebarTokens[resultId]) {
        searchResultNfts.push(sidebarTokens[resultId]);
      }
    }

    return searchResultNfts;
  }, [debouncedSearchQuery, searchResults, sidebarTokens, sidebarTokensAsArray]);

  const nftFragmentsKeyedByID = useMemo(
    () => keyBy(nonNullTokens, (token) => token.dbid),
    [nonNullTokens]
  );

  const editModeTokensFilteredToSelectedChain = useMemo(() => {
    return editModeTokensSearchResults.filter((editModeToken) => {
      const token = nftFragmentsKeyedByID[editModeToken.id];

      if (!token) {
        return false;
      }

      return token.chain === selectedChain;
    });
  }, [editModeTokensSearchResults, nftFragmentsKeyedByID, selectedChain]);

  return (
    <StyledSidebar>
      <StyledSidebarContainer>
        <Header>
          <TitleS>All pieces</TitleS>
          {
            // prevent accidental refreshing for profiles we want to keep in tact
            is3ac ? null : (
              <StyledRefreshButton
                text={isRefreshingNfts ? 'Refreshing...' : 'Refresh wallet'}
                onClick={handleRefreshNfts}
                disabled={isRefreshingNfts}
              />
            )
          }
        </Header>
        <SearchBar
          tokensRef={nonNullTokens}
          setSearchResults={setSearchResults}
          setDebouncedSearchQuery={setDebouncedSearchQuery}
        />
      </StyledSidebarContainer>
      {/* TODO(Terence): Enable this when we enable POAP / Tezos */}
      {/*<SidebarChains selected={selectedChain} onChange={setSelectedChain} />*/}
      <SidebarTokens
        debouncedSearchQuery={debouncedSearchQuery}
        tokenRefs={nonNullTokens}
        editModeTokens={editModeTokensFilteredToSelectedChain}
      />
    </StyledSidebar>
  );
}

type SidebarTokensProps = {
  debouncedSearchQuery: string;
  tokenRefs: SidebarTokensFragment$key;
  editModeTokens: EditModeToken[];
};

const SidebarTokens = ({ tokenRefs, editModeTokens, debouncedSearchQuery }: SidebarTokensProps) => {
  const tokens = useFragment(
    graphql`
      fragment SidebarTokensFragment on Token @relay(plural: true) {
        dbid

        ...SidebarNftIconFragment

        contract {
          name
          contractAddress {
            address
          }
        }
      }
    `,
    tokenRefs
  );

  const virtualizedListRef = useRef<List | null>(null);

  const [erroredTokenIds, setErroredTokenIds] = useState<Set<string>>(new Set());
  const [collapsedCollections, setCollapsedCollections] = useState<Set<string>>(new Set());

  const handleMarkErroredTokenId = useCallback((id) => {
    setErroredTokenIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const handleMarkSuccessTokenId = useCallback((id) => {
    setErroredTokenIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const toggleExpanded = useCallback((address: string) => {
    setCollapsedCollections((previous) => {
      const next = new Set(previous);

      if (next.has(address)) {
        next.delete(address);
      } else {
        next.add(address);
      }

      return next;
    });
  }, []);

  const groups = useMemo(() => {
    return groupCollectionsByAddress({ tokens, editModeTokens });
  }, [editModeTokens, tokens]);

  const rows = useMemo(() => {
    return createVirtualizedRows({ groups, erroredTokenIds, collapsedCollections });
  }, [collapsedCollections, erroredTokenIds, groups]);

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
            onClick={() => toggleExpanded(row.address)}
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
              if (tokenOrWhitespace === 'whitespace') {
                return <AddBlankBlock key="whitespace" />;
              }

              return (
                <SidebarNftIcon
                  key={tokenOrWhitespace.token.dbid}
                  tokenRef={tokenOrWhitespace.token}
                  editModeToken={tokenOrWhitespace.editModeToken}
                  handleTokenRenderError={handleMarkErroredTokenId}
                  handleTokenRenderSuccess={handleMarkSuccessTokenId}
                />
              );
            })}
          </Selection>
        );
      }
    },
    [handleMarkErroredTokenId, handleMarkSuccessTokenId, rows, toggleExpanded]
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

  // Important to useLayoutEffect to avoid flashing of the
  // React Virtualized component.
  useLayoutEffect(
    function recomputeRowHeightsWhenCollectionExpanded() {
      virtualizedListRef.current?.recomputeRowHeights();
    },
    [collapsedCollections]
  );

  // This ensures a user sees what they're searching for
  // even if they had a section collapsed before they
  // started searching
  useEffect(
    function resetExpandedCollectionsWhenSearching() {
      setCollapsedCollections(new Set());
    },
    [debouncedSearchQuery]
  );

  return (
    <StyledListTokenContainer>
      <AutoSizer>
        {({ width, height }) => (
          <List
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
};

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

const StyledSidebar = styled.div`
  display: flex;
  flex-direction: column;

  padding: 16px;
  height: calc(100vh - ${FOOTER_HEIGHT}px);
  border-right: 1px solid ${colors.porcelain};
  user-select: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const StyledSidebarContainer = styled.div`
  padding-bottom: 8px;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const StyledListTokenContainer = styled.div`
  width: 100%;
  flex-grow: 1;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  min-height: 52px;
  padding-bottom: 16px;
`;

const Selection = styled.div`
  display: flex;
  grid-gap: ${SIDEBAR_ICON_GAP}px;
`;

// This has the styling from InteractiveLink but we cannot use InteractiveLink because it is a TextButton
const StyledRefreshButton = styled(TextButton)`
  & p {
    font-size: 14px;
    line-height: 18px;
    text-transform: none;
    text-decoration: underline;
  }
`;

export default memo(Sidebar);
