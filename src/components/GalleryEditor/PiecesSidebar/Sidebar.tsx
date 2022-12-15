import keyBy from 'lodash.keyby';
import { memo, useCallback, useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import colors from '~/components/core/colors';
import { VStack } from '~/components/core/Spacer/Stack';
import { TitleS } from '~/components/core/Text/Text';
import { Chain } from '~/components/ManageGallery/OrganizeCollection/Sidebar/chains';
import { SidebarChainSelector } from '~/components/ManageGallery/OrganizeCollection/Sidebar/SidebarChainSelector';
import { SidebarTokens } from '~/components/ManageGallery/OrganizeCollection/Sidebar/SidebarTokens';
import {
  SidebarTokensState,
  useCollectionEditorActions,
} from '~/contexts/collectionEditor/CollectionEditorContext';
import { useReportError } from '~/contexts/errorReporting/ErrorReportingContext';
import { useGlobalNavbarHeight } from '~/contexts/globalLayout/GlobalNavbar/useGlobalNavbarHeight';
import { useToastActions } from '~/contexts/toast/ToastContext';
import { SidebarNewFragment$key } from '~/generated/SidebarNewFragment.graphql';
import { SidebarViewerNewFragment$key } from '~/generated/SidebarViewerNewFragment.graphql';
import useSyncTokens from '~/hooks/api/tokens/useSyncTokens';
import { generate12DigitId } from '~/utils/collectionLayout';
import { removeNullValues } from '~/utils/removeNullValues';

import { convertObjectToArray } from '../convertObjectToArray';
import { AddWalletSidebar } from './AddWalletSidebar';
import SearchBar from './SearchBar';
import { SidebarView, SidebarViewSelector } from './SidebarViewSelector';

type Props = {
  sidebarTokens: SidebarTokensState;
  tokensRef: SidebarNewFragment$key;
  queryRef: SidebarViewerNewFragment$key;
};

function Sidebar({ tokensRef, sidebarTokens, queryRef }: Props) {
  const allTokens = useFragment(
    graphql`
      fragment SidebarNewFragment on Token @relay(plural: true) {
        dbid
        chain
        isSpamByUser
        isSpamByProvider

        ...SearchBarNewFragment
        ...SidebarTokensNewFragment
      }
    `,
    tokensRef
  );

  const query = useFragment(
    graphql`
      fragment SidebarViewerNewFragment on Query {
        viewer {
          ... on Viewer {
            user {
              wallets {
                chainAddress {
                  chain
                }
              }
            }
          }
        }

        ...SidebarChainSelectorNewFragment
        ...AddWalletSidebarQueryNewFragment
      }
    `,
    queryRef
  );

  const { stageTokens } = useCollectionEditorActions();
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [selectedChain, setSelectedChain] = useState<Chain>('Ethereum');
  const [selectedView, setSelectedView] = useState<SidebarView>('Collected');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  const { pushToast } = useToastActions();
  const reportError = useReportError();

  const navbarHeight = useGlobalNavbarHeight();

  const isSearching = debouncedSearchQuery.length > 0;

  const nonNullTokens = removeNullValues(allTokens);
  const sidebarTokensAsArray = useMemo(() => convertObjectToArray(sidebarTokens), [sidebarTokens]);

  // Only show blank space + add account button
  // 1. if the user don't have selected account
  // 2. the selected chain is selected account
  const ownsWalletFromSelectedChain = useMemo(() => {
    let chain = selectedChain;
    if (selectedChain === 'POAP') {
      chain = 'Ethereum';
    }

    const ownsWalletFromChain = query.viewer?.user?.wallets?.some(
      (wallet) => wallet?.chainAddress?.chain === chain
    );

    return ownsWalletFromChain ?? false;
  }, [query, selectedChain]);

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

      if (token.chain !== selectedChain) {
        return false;
      }

      const isSpam = token.isSpamByUser !== null ? token.isSpamByUser : token.isSpamByProvider;

      if (selectedView === 'Hidden') {
        return isSpam;
      }
      return !isSpam;
    });
  }, [
    editModeTokensSearchResults,
    isSearching,
    nftFragmentsKeyedByID,
    selectedChain,
    selectedView,
  ]);

  const { isLocked, syncTokens } = useSyncTokens();

  const handleRefresh = useCallback(async () => {
    if (!selectedChain || isLocked) {
      return;
    }

    pushToast({
      message: 'We’re retrieving your new pieces. This may take up to a few minutes.',
      autoClose: true,
    });

    try {
      await syncTokens(selectedChain);
    } catch (e) {
      if (e instanceof Error) {
        reportError(e);
      } else {
        reportError('Could not run SidebarChainSelectorMutation for an unknown reason');
      }
    }
  }, [isLocked, pushToast, reportError, selectedChain, syncTokens]);

  return (
    <StyledSidebar navbarHeight={navbarHeight}>
      <StyledSidebarContainer gap={8}>
        <Header>
          <TitleS>Add pieces</TitleS>
        </Header>
        <SearchBar
          tokensRef={nonNullTokens}
          setSearchResults={setSearchResults}
          setDebouncedSearchQuery={setDebouncedSearchQuery}
        />
        {!isSearching && (
          <>
            <div>
              <SidebarViewSelector selectedView={selectedView} setSelectedView={setSelectedView} />
              <SidebarChainSelector
                ownsWalletFromSelectedChain={ownsWalletFromSelectedChain}
                queryRef={query}
                selected={selectedChain}
                onChange={setSelectedChain}
                handleRefresh={handleRefresh}
                isRefreshingNfts={isLocked}
              />
            </div>
            {ownsWalletFromSelectedChain && (
              <AddBlankSpaceButton onClick={handleAddBlankBlockClick} variant="secondary">
                ADD BLANK SPACE
              </AddBlankSpaceButton>
            )}
          </>
        )}

        {ownsWalletFromSelectedChain ? (
          <SidebarTokens
            isSearching={isSearching}
            tokenRefs={nonNullTokens}
            selectedChain={selectedChain}
            selectedView={selectedView}
            editModeTokens={tokensToDisplay}
          />
        ) : (
          <AddWalletSidebar
            selectedChain={selectedChain}
            queryRef={query}
            handleRefresh={handleRefresh}
          />
        )}
      </StyledSidebarContainer>
    </StyledSidebar>
  );
}

const StyledSidebarContainer = styled(VStack)`
  padding: 0 4px;
  height: 100%;
`;

const AddBlankSpaceButton = styled(Button)`
  margin: 0 12px;
`;

const StyledSidebar = styled.div<{ navbarHeight: number }>`
  display: flex;
  flex-direction: column;

  padding-top: 16px;

  height: 100%;
  border-right: 1px solid ${colors.porcelain};
  user-select: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Header = styled.div`
  padding: 0 12px 8px;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
`;

export default memo(Sidebar);
