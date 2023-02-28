import { useCallback, useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import colors from '~/components/core/colors';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { Spinner } from '~/components/core/Spinner/Spinner';
import { TitleS } from '~/components/core/Text/Text';
import { Chain } from '~/components/GalleryEditor/PiecesSidebar/chains';
import { SidebarChainSelector } from '~/components/GalleryEditor/PiecesSidebar/SidebarChainSelector';
import { SidebarTokens } from '~/components/GalleryEditor/PiecesSidebar/SidebarTokens';
import { NewTooltip } from '~/components/Tooltip/NewTooltip';
import { useTooltipHover } from '~/components/Tooltip/useTooltipHover';
import { useCollectionEditorContext } from '~/contexts/collectionEditor/CollectionEditorContext';
import { useGlobalNavbarHeight } from '~/contexts/globalLayout/GlobalNavbar/useGlobalNavbarHeight';
import { PiecesSidebarFragment$key } from '~/generated/PiecesSidebarFragment.graphql';
import { PiecesSidebarViewerFragment$key } from '~/generated/PiecesSidebarViewerFragment.graphql';
import useSyncTokens from '~/hooks/api/tokens/useSyncTokens';
import { RefreshIcon } from '~/icons/RefreshIcon';
import { doesUserOwnWalletFromChain } from '~/utils/doesUserOwnWalletFromChain';
import { removeNullValues } from '~/utils/removeNullValues';

import OnboardingDialog from '../GalleryOnboardingGuide/OnboardingDialog';
import { useOnboardingDialogContext } from '../GalleryOnboardingGuide/OnboardingDialogContext';
import { AddWalletSidebar } from './AddWalletSidebar';
import isRefreshDisabledForUser from './isRefreshDisabledForUser';
import SearchBar from './SearchBar';
import { SidebarView, SidebarViewSelector } from './SidebarViewSelector';

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

        ...SearchBarFragment
        ...SidebarTokensFragment
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
        ...doesUserOwnWalletFromChainFragment
        ...AddWalletSidebarQueryFragment
      }
    `,
    queryRef
  );

  const { step, dialogMessage, nextStep, handleClose } = useOnboardingDialogContext();
  const { isLocked, syncTokens } = useSyncTokens();
  const { addWhitespace } = useCollectionEditorContext();

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

  const isRefreshDisabledAtUserLevel = isRefreshDisabledForUser(query.viewer?.user?.dbid ?? '');
  const refreshDisabled =
    isRefreshDisabledAtUserLevel || !doesUserOwnWalletFromChain(selectedChain, query);
  const handleRefresh = useCallback(async () => {
    if (refreshDisabled) {
      return;
    }

    await syncTokens(selectedChain);
  }, [selectedChain, refreshDisabled, syncTokens]);

  const { floating, reference, getFloatingProps, getReferenceProps, floatingStyle } =
    useTooltipHover({ placement: 'top' });

  const {
    floating: refreshFloating,
    reference: refreshReference,
    getFloatingProps: getRefreshFloatingProps,
    getReferenceProps: getRefreshReferenceProps,
    floatingStyle: refreshFloatingStyle,
  } = useTooltipHover({ disabled: refreshDisabled, placement: 'top' });

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
              <SidebarChainSelector selected={selectedChain} onChange={setSelectedChain} />
            </div>
            {ownsWalletFromSelectedChain && (
              <StyledButtonContainer>
                <StyledButton
                  onClick={handleRefresh}
                  variant="primary"
                  disabled={refreshDisabled}
                  ref={refreshReference}
                  {...getRefreshReferenceProps()}
                >
                  <HStack gap={8} align="center">
                    {isLocked ? (
                      <Spinner />
                    ) : (
                      <>
                        REFRESH
                        <RefreshIcon />
                      </>
                    )}
                  </HStack>
                </StyledButton>
                <StyledButton
                  onClick={handleAddBlankBlockClick}
                  variant="secondary"
                  ref={reference}
                  {...getReferenceProps()}
                >
                  BLANK SPACE
                </StyledButton>
              </StyledButtonContainer>
            )}

            <NewTooltip
              {...getFloatingProps()}
              style={floatingStyle}
              ref={floating}
              text="Add negative space to your gallery"
            />

            <NewTooltip
              {...getRefreshFloatingProps()}
              style={refreshFloatingStyle}
              ref={refreshFloating}
              text={isLocked ? `Refreshing...` : `Fetch latest ${selectedChain} pieces`}
            />
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

const StyledButtonContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  padding: 0 12px;
`;

const StyledButton = styled(Button)`
  padding: 8px 12px;
`;
