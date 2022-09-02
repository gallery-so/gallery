import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import { TitleS } from 'components/core/Text/Text';
import { FOOTER_HEIGHT } from 'flows/shared/components/WizardFooter/WizardFooter';
import {
  SidebarTokensState,
  useCollectionEditorActions,
} from 'contexts/collectionEditor/CollectionEditorContext';
import { convertObjectToArray } from '../convertObjectToArray';
import SearchBar from './SearchBar';
import colors from 'components/core/colors';
import { graphql, useFragment } from 'react-relay';
import { SidebarFragment$key } from '__generated__/SidebarFragment.graphql';
import { removeNullValues } from 'utils/removeNullValues';
import { SidebarViewerFragment$key } from '__generated__/SidebarViewerFragment.graphql';
import { EditModeToken } from '../types';
import keyBy from 'lodash.keyby';
import {
  Chain,
  SidebarChainSelector,
} from 'flows/shared/steps/OrganizeCollection/Sidebar/SidebarChainSelector';
import { SidebarTokensFragment$key } from '../../../../../../__generated__/SidebarTokensFragment.graphql';
import { groupCollectionsByAddress } from 'flows/shared/steps/OrganizeCollection/Sidebar/groupCollectionsByAddress';
import {
  createVirtualizedRowsFromGroups,
  createVirtualizedRowsFromTokens,
} from 'flows/shared/steps/OrganizeCollection/Sidebar/createVirtualizedRowsFromGroups';
import { SidebarList } from 'flows/shared/steps/OrganizeCollection/Sidebar/SidebarList';
import { Button } from 'components/core/Button/Button';
import { generate12DigitId } from 'utils/collectionLayout';

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
        ...SidebarChainSelectorFragment
      }
    `,
    viewerRef
  );

  const { stageTokens } = useCollectionEditorActions();
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [selectedChain, setSelectedChain] = useState<Chain>('Ethereum');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  const isSearching = debouncedSearchQuery.length > 0;

  const nonNullTokens = removeNullValues(allTokens);
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

  const handleAddBlankBlockClick = useCallback(() => {
    const id = `blank-${generate12DigitId()}`;
    stageTokens([{ id, whitespace: 'whitespace' }]);
    // auto scroll so that the new block is visible. 100ms timeout to account for async nature of staging tokens
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [stageTokens]);

  const tokensToDisplay = useMemo(() => {
    return editModeTokensSearchResults.filter((editModeToken) => {
      const token = nftFragmentsKeyedByID[editModeToken.id];

      // Ensure we have a 1-1 match.
      // Every EditModeToken should have a Token from Relay
      if (!token) {
        return false;
      }

      // If we're searching, we want to search across all chains
      if (isSearching) {
        return true;
      }

      return token.chain === selectedChain;
    });
  }, [editModeTokensSearchResults, isSearching, nftFragmentsKeyedByID, selectedChain]);

  return (
    <StyledSidebar>
      <StyledSidebarContainer>
        <Header>
          <TitleS>All pieces</TitleS>
        </Header>
        <SearchBar
          tokensRef={nonNullTokens}
          setSearchResults={setSearchResults}
          setDebouncedSearchQuery={setDebouncedSearchQuery}
        />
      </StyledSidebarContainer>
      {!isSearching && (
        <>
          <SidebarChainSelector
            viewerRef={viewer}
            selected={selectedChain}
            onChange={setSelectedChain}
          />
          <AddBlankSpaceButton onClick={handleAddBlankBlockClick} variant="secondary">
            ADD BLANK SPACE
          </AddBlankSpaceButton>
        </>
      )}
      <SidebarTokens
        isSearching={isSearching}
        tokenRefs={nonNullTokens}
        selectedChain={selectedChain}
        editModeTokens={tokensToDisplay}
      />
    </StyledSidebar>
  );
}

const AddBlankSpaceButton = styled(Button)`
  margin: 4px 0;
`;

type SidebarTokensProps = {
  isSearching: boolean;
  selectedChain: Chain;
  editModeTokens: EditModeToken[];
  tokenRefs: SidebarTokensFragment$key;
};

const SidebarTokens = ({
  tokenRefs,
  isSearching,
  selectedChain,
  editModeTokens,
}: SidebarTokensProps) => {
  const tokens = useFragment(
    graphql`
      fragment SidebarTokensFragment on Token @relay(plural: true) {
        dbid

        chain

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

  let shouldUseCollectionGrouping: boolean;
  if (isSearching) {
    shouldUseCollectionGrouping = true;
  } else {
    shouldUseCollectionGrouping = selectedChain !== 'POAP';
  }

  const rows = useMemo(() => {
    if (shouldUseCollectionGrouping) {
      const groups = groupCollectionsByAddress({ tokens, editModeTokens });

      return createVirtualizedRowsFromGroups({ groups, erroredTokenIds, collapsedCollections });
    } else {
      return createVirtualizedRowsFromTokens({ tokens, editModeTokens, erroredTokenIds });
    }
  }, [collapsedCollections, editModeTokens, erroredTokenIds, shouldUseCollectionGrouping, tokens]);

  useEffect(
    function resetCollapsedSectionsWhileSearching() {
      if (isSearching) {
        setCollapsedCollections(new Set());
      }
    },
    [isSearching]
  );

  return (
    <SidebarList
      rows={rows}
      onToggleExpanded={handleToggleExpanded}
      handleTokenRenderError={handleMarkErroredTokenId}
      handleTokenRenderSuccess={handleMarkSuccessTokenId}
      shouldUseCollectionGrouping={shouldUseCollectionGrouping}
    />
  );
};

const StyledSidebar = styled.div`
  display: flex;
  flex-direction: column;

  // We need to save the bottom padding for the
  // scrollable icon section. It will have its own padding
  padding: 16px 16px 0 16px;

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

export default memo(Sidebar);
