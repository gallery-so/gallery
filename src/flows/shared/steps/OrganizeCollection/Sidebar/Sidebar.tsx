import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import { TitleS } from 'components/core/Text/Text';
import { FOOTER_HEIGHT } from 'flows/shared/components/WizardFooter/WizardFooter';
import { SidebarTokensState } from 'contexts/collectionEditor/CollectionEditorContext';
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

  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [selectedChain, setSelectedChain] = useState<Chain>('Ethereum');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

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
        </Header>
        <SearchBar
          tokensRef={nonNullTokens}
          setSearchResults={setSearchResults}
          setDebouncedSearchQuery={setDebouncedSearchQuery}
        />
      </StyledSidebarContainer>
      <SidebarChainSelector
        viewerRef={viewer}
        selected={selectedChain}
        onChange={setSelectedChain}
      />
      <SidebarTokens
        tokenRefs={nonNullTokens}
        selectedChain={selectedChain}
        debouncedSearchQuery={debouncedSearchQuery}
        editModeTokens={editModeTokensFilteredToSelectedChain}
      />
    </StyledSidebar>
  );
}

type SidebarTokensProps = {
  selectedChain: Chain;
  debouncedSearchQuery: string;
  editModeTokens: EditModeToken[];
  tokenRefs: SidebarTokensFragment$key;
};

const SidebarTokens = ({
  tokenRefs,
  selectedChain,
  editModeTokens,
  debouncedSearchQuery,
}: SidebarTokensProps) => {
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

  const rows = useMemo(() => {
    console.log({ selectedChain });
    if (selectedChain === 'POAP') {
      return createVirtualizedRowsFromTokens({ tokens, editModeTokens, erroredTokenIds });
    } else {
      const groups = groupCollectionsByAddress({ tokens, editModeTokens });

      return createVirtualizedRowsFromGroups({ groups, erroredTokenIds, collapsedCollections });
    }
  }, [collapsedCollections, editModeTokens, erroredTokenIds, selectedChain, tokens]);

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

export default memo(Sidebar);
