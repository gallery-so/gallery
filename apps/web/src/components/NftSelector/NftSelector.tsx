import { Suspense, useCallback, useEffect, useMemo } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useSyncCreatedTokensForExistingContract } from 'src/hooks/api/tokens/useSyncCreatedTokensForExistingContract';
import styled from 'styled-components';

import { usePostComposerContext } from '~/contexts/postComposer/PostComposerContext';
import { NftSelectorQuery } from '~/generated/NftSelectorQuery.graphql';
import useSyncTokens from '~/hooks/api/tokens/useSyncTokens';
import { ChevronLeftIcon } from '~/icons/ChevronLeftIcon';
import { RefreshIcon } from '~/icons/RefreshIcon';
import { contexts } from '~/shared/analytics/constants';
import { GalleryElementTrackingProps, useTrack } from '~/shared/contexts/AnalyticsContext';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import { chains } from '~/shared/utils/chains';
import { doesUserOwnWalletFromChainFamily } from '~/shared/utils/doesUserOwnWalletFromChainFamily';

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
import NftSelectorTokens from './NftSelectorTokens';

type Props = {
  onSelectToken: (tokenId: string) => void;
  headerText: string;
  preSelectedContract?: NftSelectorContractType;
  eventFlow?: GalleryElementTrackingProps['eventFlow'];
};

export type NftSelectorContractType = Omit<NftSelectorCollectionGroup, 'tokens'> | null;

export function NftSelector(props: Props) {
  return (
    <Suspense fallback={<NftSelectorLoadingView />}>
      <NftSelectorInner {...props} />
    </Suspense>
  );
}

function NftSelectorInner({ onSelectToken, headerText, preSelectedContract, eventFlow }: Props) {
  const query = useLazyLoadQuery<NftSelectorQuery>(
    graphql`
      query NftSelectorQuery {
        ...doesUserOwnWalletFromChainFamilyFragment
        ...NftSelectorFilterNetworkFragment

        viewer {
          ... on Viewer {
            user {
              dbid

              tokens(ownershipFilter: [Creator, Holder]) {
                __typename

                dbid
                creationTime
                definition {
                  name
                  chain
                  contract {
                    dbid
                    name
                    isSpam
                  }
                }

                isSpamByUser

                ownerIsHolder
                ownerIsCreator

                ...useTokenSearchResultsFragment
                ...NftSelectorTokensFragment

                # Needed for when we select a token, we want to have this already in the cache
                # eslint-disable-next-line relay/must-colocate-fragment-spreads
                ...PostComposerTokenFragment
              }
            }
          }
        }
        ...NftSelectorTokensQueryFragment
      }
    `,
    {}
  );

  const tokens = useMemo(
    () => removeNullValues(query.viewer?.user?.tokens),
    [query.viewer?.user?.tokens]
  );
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

  const track = useTrack();

  const handleSelectContract = useCallback(
    (contract: NftSelectorContractType) => {
      track('Select Contract on Post Composer Modal', {
        context: contexts.Posts,
        flow: eventFlow,
      });
      setSelectedContract(contract);
    },
    [eventFlow, setSelectedContract, track]
  );

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
      const isSpam =
        token.isSpamByUser === null ? token.definition.contract?.isSpam : token.isSpamByUser;

      // If we're searching, we want to search across all chains; the chain selector will be hidden during search
      if (isSearching) {
        return true;
      }

      // Check if network is 'All Networks', then return true for all tokens
      if (network === 'All Networks') {
        return !isSpam;
      }

      if (token.definition.chain !== network) {
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
        const contractA = a.definition.contract?.name?.toLocaleLowerCase();
        const contractB = b.definition.contract?.name?.toLocaleLowerCase();

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

  const isRefreshDisabledAtUserLevel = isRefreshDisabledForUser(query?.viewer?.user?.dbid ?? '');
  const refreshDisabled =
    isRefreshDisabledAtUserLevel || !ownsWalletFromSelectedChainFamily || isLocked;

  const availableChains = chains
    .filter((chain) => chain.name !== 'All Networks')
    .map((chain) => chain.name as Exclude<(typeof chains)[number]['name'], 'All Networks'>);

  const handleRefresh = useCallback(async () => {
    if (refreshDisabled) {
      return;
    }

    track('NFT Selector: Clicked Refresh', {
      context: contexts.Posts,
      flow: eventFlow,
    });

    if (filterType === 'Hidden') {
      return;
    }
    await syncTokens({
      type: filterType,
      chain: network === 'All Networks' ? availableChains : network,
    });
  }, [refreshDisabled, track, eventFlow, filterType, syncTokens, network, availableChains]);

  const [syncCreatedTokensForExistingContract, isContractRefreshing] =
    useSyncCreatedTokensForExistingContract();
  const contractRefreshDisabled = filterType !== 'Created' || isContractRefreshing;

  const handleCreatorRefreshContract = useCallback(async () => {
    if (!selectedContract?.dbid) {
      return;
    }
    track('NFT Selector: Clicked Sync Creator Tokens For Existing Contract', {
      id: 'Refresh Single Created Tokens Contract Button',
      context: contexts.Posts,
    });

    await syncCreatedTokensForExistingContract(selectedContract?.dbid);
  }, [selectedContract?.dbid, track, syncCreatedTokensForExistingContract]);

  const { floating, reference, getFloatingProps, getReferenceProps, floatingStyle } =
    useTooltipHover({
      placement: 'bottom-end',
    });

  // Auto-sync tokens when the chain or Collected/Created filter changes, and there are 0 tokens to display
  useEffect(() => {
    if (ownsWalletFromSelectedChainFamily && tokensToDisplay.length === 0 && !isSearching) {
      handleRefresh();
    }

    // we only want to consider auto-syncing tokens if selectedNetworkView changes, so limit dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network, filterType]);

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
              {filterType === 'Created' && (
                <>
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
                </>
              )}
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

      <NftSelectorTokens
        selectedFilter={filterType}
        tokenRefs={tokensToDisplay}
        selectedContractAddress={selectedContract?.address ?? null}
        onSelectContract={handleSelectContract}
        onSelectToken={onSelectToken}
        eventFlow={eventFlow}
        selectedNetworkView={network}
        hasSearchKeyword={isSearching}
        handleRefresh={handleRefresh}
        queryRef={query}
      />
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
