import { useCallback, useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { NftSelectorFragment$key } from '~/generated/NftSelectorFragment.graphql';
import { NftSelectorQueryFragment$key } from '~/generated/NftSelectorQueryFragment.graphql';
import useSyncTokens from '~/hooks/api/tokens/useSyncTokens';
import { ChevronLeftIcon } from '~/icons/ChevronLeftIcon';
import { RefreshIcon } from '~/icons/RefreshIcon';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import useDebounce from '~/shared/hooks/useDebounce';
import { Chain } from '~/shared/utils/chains';
import { doesUserOwnWalletFromChainFamily } from '~/utils/doesUserOwnWalletFromChainFamily';

import IconContainer from '../core/IconContainer';
import { HStack, VStack } from '../core/Spacer/Stack';
import { BaseM } from '../core/Text/Text';
import isRefreshDisabledForUser from '../GalleryEditor/PiecesSidebar/isRefreshDisabledForUser';
import { SidebarView } from '../GalleryEditor/PiecesSidebar/SidebarViewSelector';
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
  tokensRef: NftSelectorFragment$key;
  queryRef: NftSelectorQueryFragment$key;
  onSelectToken: (tokenId: string) => void;
  headerText: string;
  preSelectedContract?: NftSelectorContractType;
};

export type NftSelectorContractType = Omit<NftSelectorCollectionGroup, 'tokens'> | null;

export function NftSelector({
  tokensRef,
  queryRef,
  onSelectToken,
  headerText,
  preSelectedContract,
}: Props) {
  const tokens = useFragment(
    graphql`
      fragment NftSelectorFragment on Token @relay(plural: true) {
        ...NftSelectorViewFragment
        name
        chain
        creationTime

        isSpamByUser
        isSpamByProvider

        contract {
          name
        }
      }
    `,
    tokensRef
  );

  const query = useFragment(
    graphql`
      fragment NftSelectorQueryFragment on Query {
        viewer {
          ... on Viewer {
            user {
              dbid
            }
          }
        }
        ...doesUserOwnWalletFromChainFamilyFragment
        ...NftSelectorFilterNetworkFragment
      }
    `,
    queryRef
  );

  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const debouncedSearchKeyword = useDebounce(searchKeyword, 200);

  const [selectedView, setSelectedView] = useState<SidebarView>('Collected');
  const [selectedSortView, setSelectedSortView] = useState<NftSelectorSortView>('Recently added');
  const [selectedNetworkView, setSelectedNetworkView] = useState<Chain>('Ethereum');

  const [selectedContract, setSelectedContract] = useState<NftSelectorContractType>(
    preSelectedContract || null
  );

  const { isLocked, syncTokens } = useSyncTokens();

  const handleResetSelectedContractAddress = useCallback(() => {
    setSelectedContract(null);
  }, []);

  const filteredTokens = useMemo(() => {
    let filteredTokens = [...tokens];

    // Filter by network
    filteredTokens = tokens.filter((token) => token.chain === selectedNetworkView);

    // Filter by search
    if (debouncedSearchKeyword) {
      const lowerCaseQuery = debouncedSearchKeyword.toLowerCase();

      filteredTokens = tokens.filter((token) => {
        if (token.name?.toLowerCase().includes(debouncedSearchKeyword)) {
          return true;
        }

        if (token.contract?.name?.toLowerCase().includes(lowerCaseQuery)) {
          return true;
        }

        return false;
      });
    }

    // Filter by view

    filteredTokens = filteredTokens.filter((token) => {
      const isSpam = token.isSpamByUser !== null ? token.isSpamByUser : token.isSpamByProvider;
      if (selectedView === 'Hidden') {
        return isSpam;
      }

      return !isSpam;
    });

    // Filter by sort
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
  }, [debouncedSearchKeyword, selectedNetworkView, selectedSortView, selectedView, tokens]);

  const track = useTrack();
  const isRefreshDisabledAtUserLevel = isRefreshDisabledForUser(query.viewer?.user?.dbid ?? '');
  const refreshDisabled =
    isRefreshDisabledAtUserLevel ||
    !doesUserOwnWalletFromChainFamily(selectedNetworkView, query) ||
    isLocked;

  const handleRefresh = useCallback(async () => {
    if (refreshDisabled) {
      return;
    }

    track('NFT Selector: Clicked Refresh');

    await syncTokens(selectedNetworkView);
  }, [refreshDisabled, track, syncTokens, selectedNetworkView]);

  const { floating, reference, getFloatingProps, getReferenceProps, floatingStyle } =
    useTooltipHover({
      placement: 'bottom-end',
    });

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
          <NftSelectorSearchBar keyword={searchKeyword} onChange={setSearchKeyword} />
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
          <HStack gap={4} align="center">
            <NftSelectorViewSelector
              selectedView={selectedView}
              onSelectedViewChange={setSelectedView}
            />
            <NftSelectorFilterSort
              selectedView={selectedSortView}
              onSelectedViewChange={setSelectedSortView}
            />
            <NftSelectorFilterNetwork
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
          </HStack>
        )}
      </StyledActionContainer>

      {isLocked ? (
        <NftSelectorLoadingView />
      ) : (
        <NftSelectorView
          tokenRefs={filteredTokens}
          selectedContractAddress={selectedContract?.address ?? null}
          onSelectContract={setSelectedContract}
          selectedNetworkView={selectedNetworkView}
          hasSearchKeyword={Boolean(debouncedSearchKeyword)}
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
