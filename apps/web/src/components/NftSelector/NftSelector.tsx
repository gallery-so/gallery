import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';
import styled from 'styled-components';

import { NftSelectorQuery } from '~/generated/NftSelectorQuery.graphql';
import { NftSelectorViewerFragment$key } from '~/generated/NftSelectorViewerFragment.graphql';
import useSyncTokens from '~/hooks/api/tokens/useSyncTokens';
import { ChevronLeftIcon } from '~/icons/ChevronLeftIcon';
import { RefreshIcon } from '~/icons/RefreshIcon';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import { Chain } from '~/shared/utils/chains';
import { doesUserOwnWalletFromChainFamily } from '~/utils/doesUserOwnWalletFromChainFamily';

import IconContainer from '../core/IconContainer';
import { HStack, VStack } from '../core/Spacer/Stack';
import { BaseM } from '../core/Text/Text';
import isRefreshDisabledForUser from '../GalleryEditor/PiecesSidebar/isRefreshDisabledForUser';
import { TokenFilterType } from '../GalleryEditor/PiecesSidebar/SidebarViewSelector';
import useTokenSearchResults from '../GalleryEditor/PiecesSidebar/useTokenSearchResults';
import { NewTooltip } from '../Tooltip/NewTooltip';
import { useTooltipHover } from '../Tooltip/useTooltipHover';
import { NftSelectorCollectionGroup } from './groupNftSelectorCollectionsByAddress';
import { NftSelectorFilterNetwork } from './NftSelectorFilter/NftSelectorFilterNetwork';
import {
  NftSelectorFilterSort,
  NftSelectorSortView,
} from './NftSelectorFilter/NftSelectorFilterSort';
import { NftSelectorViewSelector } from './NftSelectorFilter/NftSelectorViewSelector';
import { NftSelectorLoadingView } from './NftSelectorLoadingView';
import { NftSelectorSearchBar } from './NftSelectorSearchBar';
import { NftSelectorView } from './NftSelectorView';

type Props = {
  onSelectToken: (tokenId: string) => void;
  headerText: string;
  preSelectedContract?: NftSelectorContractType;
};

export type NftSelectorContractType = Omit<NftSelectorCollectionGroup, 'tokens'> | null;

export function NftSelector(props: Props) {
  return (
    <Suspense fallback={<NftSelectorLoadingView />}>
      <NftSelectorInner {...props} />
    </Suspense>
  );
}

function NftSelectorInner({ onSelectToken, headerText, preSelectedContract }: Props) {
  const query = useLazyLoadQuery<NftSelectorQuery>(
    graphql`
      query NftSelectorQuery {
        ...doesUserOwnWalletFromChainFamilyFragment
        ...NftSelectorFilterNetworkFragment

        viewer {
          ... on Viewer {
            ...NftSelectorViewerFragment
          }
        }
      }
    `,
    {}
  );

  const viewer = useFragment<NftSelectorViewerFragment$key>(
    graphql`
      fragment NftSelectorViewerFragment on Viewer {
        user {
          dbid

          tokens(ownershipFilter: [Creator, Holder]) {
            __typename

            dbid
            name
            chain
            creationTime

            isSpamByUser
            isSpamByProvider

            ownerIsHolder
            ownerIsCreator

            contract {
              name
            }

            ...useTokenSearchResultsFragment
            ...NftSelectorViewFragment

            # Needed for when we select a token, we want to have this already in the cache
            # eslint-disable-next-line relay/must-colocate-fragment-spreads
            ...PostComposerTokenFragment
          }
        }
      }
    `,
    query.viewer
  );

  const tokens = useMemo(() => removeNullValues(viewer?.user?.tokens), [viewer?.user?.tokens]);

  const { searchQuery, setSearchQuery, tokenSearchResults, isSearching } = useTokenSearchResults<
    (typeof tokens)[0]
  >({
    tokensRef: tokens,
    rawTokensToDisplay: tokens,
  });

  const [selectedView, setSelectedView] = useState<TokenFilterType>('Collected');
  const [selectedSortView, setSelectedSortView] = useState<NftSelectorSortView>('Recently added');
  const [selectedNetworkView, setSelectedNetworkView] = useState<Chain>('Ethereum');

  const [selectedContract, setSelectedContract] = useState<NftSelectorContractType>(
    preSelectedContract || null
  );

  const { isLocked, syncTokens } = useSyncTokens();

  const handleResetSelectedContractAddress = useCallback(() => {
    setSelectedContract(null);
  }, []);

  // [GAL-4202] this logic could be consolidated across web editor + web selector + mobile selector
  const tokensToDisplay = useMemo(() => {
    // Filter tokens
    const filteredTokens = tokenSearchResults.filter((token) => {
      // If we're searching, we want to search across all chains; the chain selector will be hidden during search
      if (isSearching) {
        return true;
      }

      if (token.chain !== selectedNetworkView) {
        return false;
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

    // Sort tokens
    if (selectedSortView === 'Recently added') {
      filteredTokens.sort((a, b) => {
        return new Date(b.creationTime).getTime() - new Date(a.creationTime).getTime();
      });
    } else if (selectedSortView === 'Oldest') {
      filteredTokens.sort((a, b) => {
        return new Date(a.creationTime).getTime() - new Date(b.creationTime).getTime();
      });
    } else if (selectedSortView === 'Alphabetical') {
      filteredTokens.sort((a, b) => {
        const contractA = a.contract?.name?.toLocaleLowerCase();
        const contractB = b.contract?.name?.toLocaleLowerCase();

        if (contractA && contractB) {
          if (contractA < contractB) {
            return -1;
          }

          if (contractA > contractB) {
            return 1;
          }

          return 0;
        }
        return 0;
      });
    }

    return filteredTokens;
  }, [isSearching, selectedNetworkView, selectedSortView, selectedView, tokenSearchResults]);

  const ownsWalletFromSelectedChainFamily = doesUserOwnWalletFromChainFamily(
    selectedNetworkView,
    query
  );

  const track = useTrack();
  const isRefreshDisabledAtUserLevel = isRefreshDisabledForUser(viewer?.user?.dbid ?? '');
  const refreshDisabled =
    isRefreshDisabledAtUserLevel || !ownsWalletFromSelectedChainFamily || isLocked;

  const handleRefresh = useCallback(async () => {
    if (refreshDisabled) {
      return;
    }

    track('NFT Selector: Clicked Refresh');

    if (selectedView === 'Hidden') {
      return;
    }

    await syncTokens({ type: selectedView, chain: selectedNetworkView });
  }, [refreshDisabled, track, selectedView, syncTokens, selectedNetworkView]);

  const { floating, reference, getFloatingProps, getReferenceProps, floatingStyle } =
    useTooltipHover({
      placement: 'bottom-end',
    });

  // Auto-sync tokens when the chain changes, and there are 0 tokens to display
  useEffect(() => {
    if (ownsWalletFromSelectedChainFamily && tokensToDisplay.length === 0 && !isSearching) {
      handleRefresh();
    }

    // we only want to consider auto-syncing tokens if selectedNetworkView changes, so limit dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNetworkView]);

  return (
    <StyledNftSelectorModal>
      <StyledTitle>
        {selectedContract ? (
          <HStack gap={8} align="center">
            <IconContainer
              onClick={handleResetSelectedContractAddress}
              variant="default"
              size="sm"
              icon={<ChevronLeftIcon />}
            />
            <StyledTitleText>{headerText}</StyledTitleText>
          </HStack>
        ) : (
          <StyledTitleText>{headerText}</StyledTitleText>
        )}
      </StyledTitle>

      <StyledActionContainer gap={16} justify="space-between">
        {!selectedContract && (
          <NftSelectorSearchBar keyword={searchQuery} onChange={setSearchQuery} />
        )}
        {selectedContract ? (
          <StyledHeaderContainer justify="space-between" align="center">
            <StyledTitleText>{selectedContract?.title}</StyledTitleText>

            <NftSelectorFilterSort
              selectedView={selectedSortView}
              onSelectedViewChange={setSelectedSortView}
            />
          </StyledHeaderContainer>
        ) : (
          <DropdownsContainer gap={4} align="center" disabled={isSearching}>
            <NftSelectorViewSelector
              isSearching={isSearching}
              selectedView={selectedView}
              onSelectedViewChange={setSelectedView}
            />
            <NftSelectorFilterSort
              selectedView={selectedSortView}
              onSelectedViewChange={setSelectedSortView}
            />
            <NftSelectorFilterNetwork
              isSearching={isSearching}
              selectedMode={selectedView}
              selectedNetwork={selectedNetworkView}
              onSelectedViewChange={setSelectedNetworkView}
              queryRef={query}
            />

            <IconContainer
              disabled={refreshDisabled}
              onClick={handleRefresh}
              size="xs"
              variant="default"
              icon={<RefreshIcon />}
              ref={reference}
              {...getReferenceProps()}
            />

            <NewTooltip
              {...getFloatingProps()}
              style={{ ...floatingStyle }}
              ref={floating}
              whiteSpace="pre-line"
              text={`Refresh to update your collection`}
            />
          </DropdownsContainer>
        )}
      </StyledActionContainer>

      {isLocked ? (
        <NftSelectorLoadingView />
      ) : (
        <NftSelectorView
          tokenRefs={tokensToDisplay}
          selectedContractAddress={selectedContract?.address ?? null}
          onSelectContract={setSelectedContract}
          selectedNetworkView={selectedNetworkView}
          hasSearchKeyword={isSearching}
          handleRefresh={handleRefresh}
          onSelectToken={onSelectToken}
        />
      )}
    </StyledNftSelectorModal>
  );
}

const StyledNftSelectorModal = styled(VStack)`
  width: 880px;
  max-height: 100%;
  min-height: 250px;
`;

const StyledTitle = styled.div`
  padding: 16px 0;
`;
const StyledTitleText = styled(BaseM)`
  font-weight: 700;
`;
const StyledActionContainer = styled(HStack)`
  padding-bottom: 8px;
`;

const StyledHeaderContainer = styled(HStack)`
  width: 100%;
`;

const DropdownsContainer = styled(HStack)<{ disabled: boolean }>`
  opacity: ${({ disabled }) => (disabled ? 0.35 : 1)};
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};
`;
