import { Suspense, useCallback, useEffect, useMemo } from 'react';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';
import styled from 'styled-components';

import { usePostComposerContext } from '~/contexts/postComposer/PostComposerContext';
import { NftSelectorQuery } from '~/generated/NftSelectorQuery.graphql';
import { NftSelectorViewerFragment$key } from '~/generated/NftSelectorViewerFragment.graphql';
import { useRefreshContract } from '~/hooks/api/tokens/useRefreshContract';
import useSyncTokens from '~/hooks/api/tokens/useSyncTokens';
import { ChevronLeftIcon } from '~/icons/ChevronLeftIcon';
import { RefreshIcon } from '~/icons/RefreshIcon';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import { doesUserOwnWalletFromChainFamily } from '~/utils/doesUserOwnWalletFromChainFamily';

import breakpoints from '../core/breakpoints';
import IconContainer from '../core/IconContainer';
import { HStack, VStack } from '../core/Spacer/Stack';
import { BaseM } from '../core/Text/Text';
import isRefreshDisabledForUser from '../GalleryEditor/PiecesSidebar/isRefreshDisabledForUser';
import useTokenSearchResults from '../GalleryEditor/PiecesSidebar/useTokenSearchResults';
import { NewTooltip } from '../Tooltip/NewTooltip';
import { useTooltipHover } from '../Tooltip/useTooltipHover';
import { NftSelectorCollectionGroup } from './groupNftSelectorCollectionsByAddress';
import { NftSelectorFilterNetwork } from './NftSelectorFilter/NftSelectorFilterNetwork';
import { NftSelectorFilterSort } from './NftSelectorFilter/NftSelectorFilterSort';
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

  const {
    filterType,
    setFilterType,
    sortType,
    setSortType,
    network,
    setNetwork,
    selectedContract,
    setSelectedContract,
  } = usePostComposerContext();

  useEffect(() => {
    if (preSelectedContract) {
      setSelectedContract(preSelectedContract);
    }
  }, [preSelectedContract, setSelectedContract]);

  const { isLocked, syncTokens } = useSyncTokens();

  const handleResetSelectedContractAddress = useCallback(() => {
    setSelectedContract(null);
  }, [setSelectedContract]);

  // [GAL-4202] this logic could be consolidated across web editor + web selector + mobile selector
  const tokensToDisplay = useMemo(() => {
    // Filter tokens
    const filteredTokens = tokenSearchResults.filter((token) => {
      // If we're searching, we want to search across all chains; the chain selector will be hidden during search
      if (isSearching) {
        return true;
      }

      if (token.chain !== network) {
        return false;
      }

      // Early return created tokens as we don't need to filter out spam
      if (filterType === 'Created') {
        return token.ownerIsCreator;
      }

      // Filter out created tokens in Collected view...
      if (filterType === 'Collected') {
        if (!token.ownerIsHolder) {
          return false;
        }
      }

      // ...but incorporate with spam filtering logic for Collected view
      const isSpam = token.isSpamByUser !== null ? token.isSpamByUser : token.isSpamByProvider;
      if (filterType === 'Hidden') {
        return isSpam;
      }

      return !isSpam;
    });

    // Sort tokens
    if (sortType === 'Recently added') {
      filteredTokens.sort((a, b) => {
        return new Date(b.creationTime).getTime() - new Date(a.creationTime).getTime();
      });
    } else if (sortType === 'Oldest') {
      filteredTokens.sort((a, b) => {
        return new Date(a.creationTime).getTime() - new Date(b.creationTime).getTime();
      });
    } else if (sortType === 'Alphabetical') {
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
  }, [filterType, isSearching, network, sortType, tokenSearchResults]);

  const ownsWalletFromSelectedChainFamily = doesUserOwnWalletFromChainFamily(network, query);

  const track = useTrack();
  const isRefreshDisabledAtUserLevel = isRefreshDisabledForUser(viewer?.user?.dbid ?? '');
  const refreshDisabled =
    isRefreshDisabledAtUserLevel || !ownsWalletFromSelectedChainFamily || isLocked;

  const handleRefresh = useCallback(async () => {
    if (refreshDisabled) {
      return;
    }

    track('NFT Selector: Clicked Refresh');

    if (filterType === 'Hidden') {
      return;
    }

    await syncTokens({ type: filterType, chain: network });
  }, [refreshDisabled, track, filterType, syncTokens, network]);

  const [refreshContract, isContractRefreshing] = useRefreshContract();
  const contractRefreshDisabled = filterType !== 'Created' || isContractRefreshing;

  const handleCreatorRefreshContract = useCallback(async () => {
    if (!selectedContract) {
      return;
    }

    track('NFT Selector: Clicked Creator Contract Refresh');
    await refreshContract(selectedContract.address);
  }, [selectedContract, track, refreshContract]);

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
  }, [network]);

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
            <HStack align="center">
              <NftSelectorFilterSort selectedView={sortType} onSelectedViewChange={setSortType} />
              <IconContainer
                disabled={contractRefreshDisabled}
                onClick={handleCreatorRefreshContract}
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
                text={`Refresh Collection`}
              />
            </HStack>
          </StyledHeaderContainer>
        ) : (
          <DropdownsContainer gap={4} align="center" disabled={isSearching}>
            <NftSelectorViewSelector
              isSearching={isSearching}
              selectedView={filterType}
              onSelectedViewChange={setFilterType}
              selectedNetwork={network}
            />
            <NftSelectorFilterSort selectedView={sortType} onSelectedViewChange={setSortType} />
            <NftSelectorFilterNetwork
              isSearching={isSearching}
              selectedMode={filterType}
              selectedNetwork={network}
              onSelectedViewChange={setNetwork}
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
              text={`Fetch your latest tokens on ${network}`}
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
          selectedNetworkView={network}
          hasSearchKeyword={isSearching}
          handleRefresh={handleRefresh}
          onSelectToken={onSelectToken}
        />
      )}
    </StyledNftSelectorModal>
  );
}

const StyledNftSelectorModal = styled(VStack)`
  max-height: 100%;
  min-height: 250px;
  width: 100%;
  padding: 16px;

  @media only screen and ${breakpoints.desktop} {
    width: 880px;
    padding: 0;
  }
`;

const StyledTitle = styled.div`
  padding-bottom: 16px;

  @media only screen and ${breakpoints.desktop} {
    padding: 16px 0;
  }
`;
const StyledTitleText = styled(BaseM)`
  font-weight: 700;
`;
const StyledActionContainer = styled(VStack)`
  padding-bottom: 8px;
  gap: 8px;

  @media only screen and ${breakpoints.desktop} {
    flex-direction: row;
    gap: 16px;
  }
`;

const StyledHeaderContainer = styled(HStack)`
  width: 100%;
`;

const DropdownsContainer = styled(HStack)<{ disabled: boolean }>`
  opacity: ${({ disabled }) => (disabled ? 0.35 : 1)};
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};

  flex-wrap: wrap;
  @media only screen and ${breakpoints.desktop} {
    flex-wrap: unset;
  }
`;
