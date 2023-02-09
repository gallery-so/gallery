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
import { useGlobalNavbarHeight } from '~/contexts/globalLayout/GlobalNavbar/useGlobalNavbarHeight';
import { PiecesSidebarNewFragment$key } from '~/generated/PiecesSidebarNewFragment.graphql';
import { PiecesSidebarViewerNewFragment$key } from '~/generated/PiecesSidebarViewerNewFragment.graphql';
import useSyncTokens from '~/hooks/api/tokens/useSyncTokens';
import { doesUserOwnWalletFromChain } from '~/utils/doesUserOwnWalletFromChain';
import { removeNullValues } from '~/utils/removeNullValues';

import OnboardingDialog from '../GalleryOnboardingGuide/OnboardingDialog';
import { useOnboardingDialogContext } from '../GalleryOnboardingGuide/OnboardingDialogContext';
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
        ...doesUserOwnWalletFromChainFragment
        ...SidebarChainSelectorNewFragment
        ...AddWalletSidebarQueryNewFragment
      }
    `,
    queryRef
  );

  const { step, dialogMessage, nextStep, handleClose } = useOnboardingDialogContext();
  const { syncTokens } = useSyncTokens();
  const { addWhitespace } = useCollectionEditorContextNew();

  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [selectedChain, setSelectedChain] = useState<Chain>('Ethereum');
  const [selectedView, setSelectedView] = useState<SidebarView>('Collected');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  const navbarHeight = useGlobalNavbarHeight();

  const isSearching = debouncedSearchQuery.length > 0;

  const nonNullTokens = removeNullValues(allTokens);

  const ownsWalletFromSelectedChain = doesUserOwnWalletFromChain(selectedChain, query);

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

  return (
    <StyledSidebar navbarHeight={navbarHeight}>
      <StyledSidebarContainer gap={8}>
        <Header align="center" justify="space-between" gap={4}>
          <TitleS>Add pieces</TitleS>
          <SidebarViewSelector selectedView={selectedView} setSelectedView={setSelectedView} />
        </Header>
        <StyledSearchBarContainer>
          <SearchBar
            tokensRef={nonNullTokens}
            setSearchResults={setSearchResults}
            setDebouncedSearchQuery={setDebouncedSearchQuery}
          />
          {step === 3 && (
            <OnboardingDialog
              step={step}
              text={dialogMessage}
              onNext={nextStep}
              onClose={handleClose}
              options={{
                placement: 'left-start',
                positionOffset: 150,
                blinkingPosition: {
                  top: 12,
                  left: 110,
                },
              }}
            />
          )}
        </StyledSearchBarContainer>
        {!isSearching && (
          <>
            <div>
              <SidebarChainSelector
                queryRef={query}
                selected={selectedChain}
                onChange={setSelectedChain}
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
            handleRefresh={() => syncTokens(selectedChain)}
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

const StyledSearchBarContainer = styled(VStack)`
  position: relative;
`;
