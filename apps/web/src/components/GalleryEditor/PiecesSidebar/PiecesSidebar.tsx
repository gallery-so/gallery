import { useCallback, useEffect, useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import { FadedInput } from '~/components/core/Input/FadedInput';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { Spinner } from '~/components/core/Spinner/Spinner';
import { TitleS } from '~/components/core/Text/Text';
import { SidebarTokens } from '~/components/GalleryEditor/PiecesSidebar/SidebarTokens';
import { useCollectionEditorContext } from '~/contexts/collectionEditor/CollectionEditorContext';
import { useGlobalNavbarHeight } from '~/contexts/globalLayout/GlobalNavbar/useGlobalNavbarHeight';
import { PiecesSidebarFragment$key } from '~/generated/PiecesSidebarFragment.graphql';
import { PiecesSidebarViewerFragment$key } from '~/generated/PiecesSidebarViewerFragment.graphql';
import useSyncTokens from '~/hooks/api/tokens/useSyncTokens';
import { RefreshIcon } from '~/icons/RefreshIcon';
import colors from '~/shared/theme/colors';
import { ChainMetadata, chainsMap } from '~/shared/utils/chains';
import { doesUserOwnWalletFromChainFamily } from '~/utils/doesUserOwnWalletFromChainFamily';

import OnboardingDialog from '../GalleryOnboardingGuide/OnboardingDialog';
import { useOnboardingDialogContext } from '../GalleryOnboardingGuide/OnboardingDialogContext';
import { AddWalletSidebar } from './AddWalletSidebar';
import CreatorEmptyStateSidebar from './CreatorEmptyStateSidebar';
import isRefreshDisabledForUser from './isRefreshDisabledForUser';
import SidebarChainDropdown from './SidebarChainDropdown';
import { SidebarViewSelector, TokenFilterType } from './SidebarViewSelector';
import SidebarWalletSelector, { SidebarWallet } from './SidebarWalletSelector';
import useTokenSearchResults from './useTokenSearchResults';

type Props = {
  tokensRef: PiecesSidebarFragment$key;
  queryRef: PiecesSidebarViewerFragment$key;
};

export function PiecesSidebar({ tokensRef, queryRef }: Props) {
  const allTokens = useFragment(
    graphql`
      fragment PiecesSidebarFragment on Token @relay(plural: true) {
        dbid
        chain
        isSpamByUser
        isSpamByProvider
        ownerIsHolder
        ownerIsCreator
        ownedByWallets {
          chainAddress {
            address
            chain
          }
        }
        ...SidebarTokensFragment

        ...useTokenSearchResultsFragment
      }
    `,
    tokensRef
  );

  const query = useFragment(
    graphql`
      fragment PiecesSidebarViewerFragment on Query {
        viewer {
          ... on Viewer {
            user {
              dbid
            }
          }
        }
        ...SidebarChainDropdownFragment
        ...doesUserOwnWalletFromChainFamilyFragment
        ...AddWalletSidebarQueryFragment
        ...SidebarWalletSelectorFragment
      }
    `,
    queryRef
  );

  const { step, dialogMessage, nextStep, handleClose } = useOnboardingDialogContext();
  const { isLocked, syncTokens } = useSyncTokens();
  const { addWhitespace } = useCollectionEditorContext();

  const { searchQuery, setSearchQuery, tokenSearchResults, isSearching } = useTokenSearchResults<
    (typeof allTokens)[0]
  >({
    tokensRef: allTokens,
    rawTokensToDisplay: allTokens,
  });

  const [selectedChain, setSelectedChain] = useState<ChainMetadata>(chainsMap['Ethereum']);
  const [selectedWallet, setSelectedWallet] = useState<SidebarWallet>('All');
  const [selectedView, setSelectedView] = useState<TokenFilterType>('Collected');

  const navbarHeight = useGlobalNavbarHeight();

  const ownsWalletFromSelectedChainFamily = doesUserOwnWalletFromChainFamily(
    selectedChain.name,
    query
  );

  const handleAddBlankBlockClick = useCallback(() => {
    addWhitespace();
  }, [addWhitespace]);

  // [GAL-4202] this logic could be consolidated across web editor + web selector + mobile selector
  // there's also wallet-specific token filtering happening in a child component, which should be lifted up here
  const tokensToDisplay = useMemo(() => {
    return tokenSearchResults.filter((token) => {
      // If we're searching, we want to search across all chains; the chain selector will be hidden during search
      if (isSearching) {
        return true;
      }

      if (token.chain !== selectedChain.name) {
        return false;
      }

      if (selectedWallet !== 'All') {
        return token?.ownedByWallets?.some((wallet) => {
          const sameWalletAddress =
            wallet?.chainAddress?.address === selectedWallet.chainAddress.address;
          const sameWalletChain = wallet?.chainAddress?.chain === selectedWallet.chainAddress.chain;
          return sameWalletAddress && sameWalletChain;
        });
      }

      // Early return created tokens as we don't need to filter out spam
      if (selectedView === 'Created') {
        return token.ownerIsCreator;
      }

      // Filter out created tokens in Collected view...
      if (selectedView === 'Collected') {
        if (!token.ownerIsHolder) {
          return false;
        }
      }

      // ...but incorporate with spam filtering logic for Collected view
      const isSpam = token.isSpamByUser !== null ? token.isSpamByUser : token.isSpamByProvider;
      if (selectedView === 'Hidden') {
        return isSpam;
      }
      return !isSpam;
    });
  }, [tokenSearchResults, isSearching, selectedChain, selectedView, selectedWallet]);

  const isRefreshDisabledAtUserLevel = isRefreshDisabledForUser(query.viewer?.user?.dbid ?? '');
  const refreshDisabled =
    isRefreshDisabledAtUserLevel ||
    !doesUserOwnWalletFromChainFamily(selectedChain.name, query) ||
    isLocked;

  const handleSelectedViewChange = useCallback((view: TokenFilterType) => {
    setSelectedView(view);

    if (view === 'Created') {
      setSelectedChain(chainsMap['Ethereum']);
    }
  }, []);

  const handleSelectedWalletChange = useCallback((wallet: SidebarWallet) => {
    setSelectedWallet(wallet);
  }, []);

  const handleSelectedChain = useCallback((chain: ChainMetadata) => {
    setSelectedChain(chain);
    setSelectedWallet('All');
  }, []);

  const handleRefresh = useCallback(async () => {
    if (refreshDisabled) {
      return;
    }

    if (selectedView === 'Hidden') {
      return;
    }

    await syncTokens({ type: selectedView, chain: selectedChain.name });
  }, [refreshDisabled, selectedView, syncTokens, selectedChain.name]);

  // Auto-sync tokens when the chain changes, and there are 0 tokens to display
  useEffect(() => {
    if (tokensToDisplay.length === 0 && !isSearching) {
      handleRefresh();
    }

    // we only want to consider auto-syncing tokens if selectedChain.name changes, so limit dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChain.name]);

  const sidebarMainContent = useMemo(() => {
    if (selectedView === 'Created') {
      if (tokensToDisplay.length) {
        return (
          <SidebarTokens
            isSearching={isSearching}
            tokenRefs={tokensToDisplay}
            selectedChain={selectedChain.name}
            selectedView={selectedView}
          />
        );
      }
      return <CreatorEmptyStateSidebar />;
    }

    if ((ownsWalletFromSelectedChainFamily && tokensToDisplay.length) || isSearching) {
      return (
        <SidebarTokens
          isSearching={isSearching}
          tokenRefs={tokensToDisplay}
          selectedChain={selectedChain.name}
          selectedView={selectedView}
        />
      );
    }
    return (
      <AddWalletSidebar
        selectedChain={selectedChain.name}
        queryRef={query}
        handleRefresh={handleRefresh}
      />
    );
  }, [
    handleRefresh,
    isSearching,
    ownsWalletFromSelectedChainFamily,
    query,
    selectedChain.name,
    selectedView,
    tokensToDisplay,
  ]);

  // this can be a 1-liner but this is easier to read tbh
  const shouldDisplayRefreshButtonGroup = useMemo(() => {
    if (!ownsWalletFromSelectedChainFamily) {
      return false;
    }
    return true;
  }, [ownsWalletFromSelectedChainFamily]);

  return (
    <StyledSidebar navbarHeight={navbarHeight}>
      <StyledSidebarContainer gap={8}>
        <FiltersContainer gap={8} disabled={isSearching}>
          <Header align="center" justify="space-between" gap={4}>
            <TitleS>Add pieces</TitleS>
            <SidebarViewSelector
              isSearching={isSearching}
              selectedView={selectedView}
              onSelectedViewChange={handleSelectedViewChange}
            />
          </Header>
          <Header align="center" justify="space-between" gap={4}>
            <TitleS>Network</TitleS>
            <SidebarChainDropdown
              queryRef={query}
              isSearching={isSearching}
              selectedChain={selectedChain}
              onSelectChain={handleSelectedChain}
              selectedView={selectedView}
            />
          </Header>
          <Header align="center" justify="space-between" gap={4}>
            <TitleS>Wallet</TitleS>
            <SidebarWalletSelector
              queryRef={query}
              isSearching={isSearching}
              selectedChain={selectedChain}
              selectedWallet={selectedWallet}
              onSelectedWalletChange={handleSelectedWalletChange}
              onConnectWalletSuccess={handleRefresh}
            />
          </Header>
        </FiltersContainer>
        <StyledSearchBarContainer>
          <FadedInput
            size="md"
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search pieces"
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
        {!isSearching && shouldDisplayRefreshButtonGroup && (
          <StyledButtonGroupContainer>
            <StyledButton onClick={handleRefresh} variant="primary" disabled={refreshDisabled}>
              <HStack gap={8} align="center">
                {isLocked ? (
                  <Spinner />
                ) : (
                  <>
                    <RefreshIcon />
                    REFRESH
                  </>
                )}
              </HStack>
            </StyledButton>
            <StyledButton onClick={handleAddBlankBlockClick} variant="secondary">
              BLANK SPACE
            </StyledButton>
          </StyledButtonGroupContainer>
        )}
        {sidebarMainContent}
      </StyledSidebarContainer>
    </StyledSidebar>
  );
}

const StyledSidebarContainer = styled(VStack)`
  padding: 0 4px;
  height: 100%;
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

const FiltersContainer = styled(VStack)<{ disabled: boolean }>`
  opacity: ${({ disabled }) => (disabled ? 0.35 : 1)};
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};
`;

const Header = styled(HStack)`
  height: 32px;
  padding: 0 12px 8px;
`;

const StyledSearchBarContainer = styled(VStack)`
  position: relative;
`;

const StyledButtonGroupContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 0 12px;
`;

const StyledButton = styled(Button)`
  padding: 8px 12px;
  width: 100%;
  font-size: 11px;
`;
