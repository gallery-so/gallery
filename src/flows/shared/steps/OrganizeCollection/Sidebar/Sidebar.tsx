import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';

import { TitleS, TitleXS } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import { FOOTER_HEIGHT } from 'flows/shared/components/WizardFooter/WizardFooter';
import TextButton from 'components/core/Button/TextButton';
import { SidebarTokensState } from 'contexts/collectionEditor/CollectionEditorContext';
import { convertObjectToArray } from '../convertObjectToArray';
import SidebarNftIcon from './SidebarNftIcon';
import SearchBar from './SearchBar';
import { useWizardState } from 'contexts/wizard/WizardDataProvider';
import colors from 'components/core/colors';
import { graphql, useFragment } from 'react-relay';
import { SidebarFragment$data, SidebarFragment$key } from '__generated__/SidebarFragment.graphql';
import { removeNullValues } from 'utils/removeNullValues';
import useIs3ac from 'hooks/oneOffs/useIs3ac';
import { SidebarViewerFragment$key } from '__generated__/SidebarViewerFragment.graphql';
import { EditModeToken } from '../types';
import { AutoSizer, Index, List, ListRowProps } from 'react-virtualized';
import {
  COLUMN_COUNT,
  SIDEBAR_COLLECTION_TITLE_BOTTOM_SPACE,
  SIDEBAR_COLLECTION_TITLE_HEIGHT,
  SIDEBAR_ICON_DIMENSIONS,
  SIDEBAR_ICON_GAP,
} from 'constants/sidebar';
import AddBlankBlock from './AddBlankBlock';
import keyBy from 'lodash.keyby';
import { SidebarNftIconFragment$key } from '../../../../../../__generated__/SidebarNftIconFragment.graphql';
import { MultichainWalletSelector } from 'components/WalletSelector/multichain/MultichainWalletSelector';
import { ETHEREUM } from 'types/Wallet';
import { TezosAuthenticateWallet } from 'components/WalletSelector/multichain/tezos/TezosAuthenticateWallet';
import {
  Chain,
  SidebarChains,
} from 'flows/shared/steps/OrganizeCollection/Sidebar/SidebarChainSelector';
import { groupBy } from 'graphql/jsutils/groupBy';
import { readInlineData } from 'relay-runtime';
import { SidebarGroupByChainFragment$key } from '../../../../../../__generated__/SidebarGroupByChainFragment.graphql';
import {
  SidebarTokensFragment$data,
  SidebarTokensFragment$key,
} from '../../../../../../__generated__/SidebarTokensFragment.graphql';
import IconContainer from 'components/core/Markdown/IconContainer';
import { ExpandedIcon } from 'flows/shared/steps/OrganizeCollection/Sidebar/ExpandedIcon';

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
  const [selectedChain, setSelectedChain] = useState<Chain>('Ethereum');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  const is3ac = useIs3ac(viewer.user?.dbid);
  const nonNullTokens = removeNullValues(allTokens);

  const { isRefreshingNfts, handleRefreshNfts } = useWizardState();

  const sidebarTokensAsArray = useMemo(() => convertObjectToArray(sidebarTokens), [sidebarTokens]);

  const tokensFilteredBySearch = useMemo(() => {
    if (debouncedSearchQuery) {
      const searchResultNfts = [];
      for (const resultId of searchResults) {
        if (sidebarTokens[resultId]) {
          searchResultNfts.push(sidebarTokens[resultId]);
        }
      }

      return searchResultNfts;
    }

    return sidebarTokensAsArray;
  }, [debouncedSearchQuery, searchResults, sidebarTokens, sidebarTokensAsArray]);

  const nftFragmentsKeyedByID = useMemo(
    () => keyBy(nonNullTokens, (token) => token.dbid),
    [nonNullTokens]
  );

  const nonNullEditModeTokens = useMemo(() => {
    return tokensFilteredBySearch.filter((editModeToken) =>
      Boolean(nftFragmentsKeyedByID[editModeToken.id])
    );
  }, [nftFragmentsKeyedByID, tokensFilteredBySearch]);

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
      <SidebarChains selected={selectedChain} onChange={setSelectedChain} />
      <SidebarTokens tokenRefs={nonNullTokens} editModeTokens={nonNullEditModeTokens} />
    </StyledSidebar>
  );
}

type SidebarTokensProps = {
  tokenRefs: SidebarTokensFragment$key;
  editModeTokens: EditModeToken[];
};

const SidebarTokens = ({ tokenRefs, editModeTokens }: SidebarTokensProps) => {
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

  const [erroredTokenIds, setErroredTokenIds] = useState(new Set());

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

  const [collectionExpandedMap, setCollectionExpandedMap] = useState<Map<string, boolean>>(
    new Map()
  );

  type CollectionGroup = {
    title: string;
    address: string;
    tokens: Array<{
      token: SidebarTokensFragment$data[number];
      editModeToken: EditModeToken;
    }>;
  };

  const groups: CollectionGroup[] = useMemo(() => {
    const tokensKeyedById = keyBy(tokens, (token) => token.dbid);

    const map: Record<string, CollectionGroup> = {};

    for (const editModeToken of editModeTokens) {
      const token = tokensKeyedById[editModeToken.id];

      if (!token?.contract?.contractAddress?.address || !token?.contract?.name) {
        continue;
      }

      if (token.contract.contractAddress.address && token.contract.name) {
        const group = map[token.contract.contractAddress.address] ?? {
          title: token.contract.name,
          address: token.contract.contractAddress.address,
          tokens: [],
        };

        map[token.contract.contractAddress.address] = group;

        group.tokens.push({
          token,
          editModeToken,
        });
      }
    }

    return Object.values(map);
  }, [editModeTokens, tokens]);

  const toggleExpanded = useCallback((address: string) => {
    setCollectionExpandedMap((previous) => {
      const newMap = new Map(previous);

      // Default to expanded
      const expanded = newMap.get(address) ?? true;

      newMap.set(address, !expanded);

      return newMap;
    });
  }, []);

  type TokenOrWhitespace =
    | { token: SidebarTokensFragment$data[number]; editModeToken: EditModeToken }
    | 'whitespace';

  type VirtualizedRow =
    | { type: 'collection-title'; expanded: boolean; address: string; title: string }
    | { type: 'tokens'; tokens: TokenOrWhitespace[]; expanded: boolean };

  const rows: VirtualizedRow[] = useMemo(() => {
    const rows: VirtualizedRow[] = [];

    for (const group of groups) {
      const tokensSortedByErrored = [...group.tokens].sort((a, b) => {
        const aIsErrored = erroredTokenIds.has(a.token.dbid);
        const bIsErrored = erroredTokenIds.has(b.token.dbid);

        if (aIsErrored === bIsErrored) {
          return 0;
        } else if (aIsErrored) {
          return -1;
        } else {
          return 1;
        }
      });

      // Default to expanded
      const expanded = collectionExpandedMap.get(group.address) ?? true;

      rows.push({ type: 'collection-title', expanded, address: group.address, title: group.title });

      const COLUMNS_PER_ROW = 3;
      for (let i = 0; i < tokensSortedByErrored.length; i += COLUMNS_PER_ROW) {
        const rowTokens = tokensSortedByErrored.slice(i, i + COLUMNS_PER_ROW);

        rows.push({ type: 'tokens', tokens: rowTokens, expanded });
      }
    }

    return rows;
  }, [collectionExpandedMap, erroredTokenIds, groups]);

  console.log({ rows, groups });

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
      console.log('rowHeightCalculator', index);
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

  const ref = useRef<List | null>(null);
  useEffect(() => {
    ref.current?.recomputeRowHeights();
  }, [collectionExpandedMap]);

  return (
    <StyledListTokenContainer>
      <AutoSizer>
        {({ width, height }) => (
          <List
            ref={ref}
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

const CollectionTitleContainer = styled.div<{ expanded: boolean }>`
  display: flex;
  align-items: center;

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
