import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';

import { TitleS } from 'components/core/Text/Text';
import { FOOTER_HEIGHT } from 'flows/shared/components/WizardFooter/WizardFooter';
import TextButton from 'components/core/Button/TextButton';
import { SidebarTokensState } from 'contexts/collectionEditor/CollectionEditorContext';
import { convertObjectToArray } from '../convertObjectToArray';
import SearchBar from './SearchBar';
import { useWizardState } from 'contexts/wizard/WizardDataProvider';
import colors from 'components/core/colors';
import { graphql, useFragment } from 'react-relay';
import { SidebarFragment$key } from '__generated__/SidebarFragment.graphql';
import { removeNullValues } from 'utils/removeNullValues';
import useIs3ac from 'hooks/oneOffs/useIs3ac';
import { SidebarViewerFragment$key } from '__generated__/SidebarViewerFragment.graphql';
import { EditModeToken } from '../types';
import { List } from 'react-virtualized';
import keyBy from 'lodash.keyby';
import {
  Chain,
  SidebarChains,
} from 'flows/shared/steps/OrganizeCollection/Sidebar/SidebarChainSelector';
import { SidebarTokensFragment$key } from '../../../../../../__generated__/SidebarTokensFragment.graphql';
import { groupCollectionsByAddress } from 'flows/shared/steps/OrganizeCollection/Sidebar/groupCollectionsByAddress';
import { createVirtualizedRows } from 'flows/shared/steps/OrganizeCollection/Sidebar/createVirtualizedRows';
import { SidebarList } from 'flows/shared/steps/OrganizeCollection/Sidebar/SidebarList';

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
      <SidebarChains selected={selectedChain} onChange={setSelectedChain} />
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

        contract {
          name
          contractAddress {
            address
          }
        }

        ...SidebarListTokenFragment
      }
    `,
    tokenRefs
  );

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

  const handleToggleExpanded = useCallback((address: string) => {
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

  const groups = useMemo(
    () => groupCollectionsByAddress({ tokens, editModeTokens }),
    [editModeTokens, tokens]
  );

  const rows = useMemo(
    () => createVirtualizedRows({ groups, erroredTokenIds, collapsedCollections }),
    [collapsedCollections, erroredTokenIds, groups]
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
    <SidebarList
      rows={rows}
      onToggleExpanded={handleToggleExpanded}
      handleTokenRenderError={handleMarkErroredTokenId}
      handleTokenRenderSuccess={handleMarkSuccessTokenId}
    />
  );
};

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

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  min-height: 52px;
  padding-bottom: 16px;
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
