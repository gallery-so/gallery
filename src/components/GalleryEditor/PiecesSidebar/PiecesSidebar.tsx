import { useCallback, useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import colors from '~/components/core/colors';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { TitleS } from '~/components/core/Text/Text';
import { Chain } from '~/components/GalleryEditor/PiecesSidebar/chains';
import { SidebarChainSelector } from '~/components/GalleryEditor/PiecesSidebar/SidebarChainSelector';
import { SidebarTokens } from '~/components/GalleryEditor/PiecesSidebar/SidebarTokens';
import { useCollectionEditorContextNew } from '~/contexts/collectionEditor/CollectionEditorContextNew';
import { useReportError } from '~/contexts/errorReporting/ErrorReportingContext';
import { useGlobalNavbarHeight } from '~/contexts/globalLayout/GlobalNavbar/useGlobalNavbarHeight';
import { useToastActions } from '~/contexts/toast/ToastContext';
import { PiecesSidebarNewFragment$key } from '~/generated/PiecesSidebarNewFragment.graphql';
import { PiecesSidebarViewerNewFragment$key } from '~/generated/PiecesSidebarViewerNewFragment.graphql';
import useSyncTokens from '~/hooks/api/tokens/useSyncTokens';
import { removeNullValues } from '~/utils/removeNullValues';

import { AddWalletSidebar } from './AddWalletSidebar';
import SearchBar from './SearchBar';
import { SidebarView, SidebarViewSelector } from './SidebarViewSelector';

type Props = {
  tokensRef: PiecesSidebarNewFragment$key;
  queryRef: PiecesSidebarViewerNewFragment$key;
};

export function PiecesSidebar({ tokensRef, queryRef }: Props) {
  const allTokens = useFragment(
    graphql`
      fragment PiecesSidebarNewFragment on Token @relay(plural: true) {
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
      fragment PiecesSidebarViewerNewFragment on Query {
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

  const { addWhitespace } = useCollectionEditorContextNew();

  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [selectedChain, setSelectedChain] = useState<Chain>('Ethereum');
  const [selectedView, setSelectedView] = useState<SidebarView>('Collected');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  const { pushToast } = useToastActions();
  const reportError = useReportError();

  const navbarHeight = useGlobalNavbarHeight();

  const isSearching = debouncedSearchQuery.length > 0;

  const nonNullTokens = removeNullValues(allTokens);

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

  const tokenSearchResults = useMemo(() => {
    if (!debouncedSearchQuery) {
      return nonNullTokens;
    }

    const searchResultsSet = new Set(searchResults);

    return nonNullTokens.filter((token) => searchResultsSet.has(token.dbid));
  }, [debouncedSearchQuery, nonNullTokens, searchResults]);

  const handleAddBlankBlockClick = useCallback(() => {
    addWhitespace();
  }, [addWhitespace]);

  const tokensToDisplay = useMemo(() => {
    return tokenSearchResults.filter((token) => {
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
  }, [tokenSearchResults, isSearching, selectedChain, selectedView]);

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
        <Header align="center" justify="space-between" gap={4}>
          <TitleS>Add pieces</TitleS>
          <SidebarViewSelector selectedView={selectedView} setSelectedView={setSelectedView} />
        </Header>
        <SearchBar
          tokensRef={nonNullTokens}
          setSearchResults={setSearchResults}
          setDebouncedSearchQuery={setDebouncedSearchQuery}
        />
        {!isSearching && (
          <>
            <div>
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
            tokenRefs={tokensToDisplay}
            selectedChain={selectedChain}
            selectedView={selectedView}
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

  max-width: 250px;
  min-width: 250px;

  padding-top: 16px;

  height: 100%;
  border-left: 1px solid ${colors.porcelain};
  user-select: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Header = styled(HStack)`
  padding: 0 12px 8px;
`;
