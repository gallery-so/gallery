import { useCallback, useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { NftSelectorQueryFragment$key } from '~/generated/NftSelectorQueryFragment.graphql';
import { ChevronLeftIcon } from '~/icons/ChevronLeftIcon';
import useDebounce from '~/shared/hooks/useDebounce';

import IconContainer from '../core/IconContainer';
import { HStack, VStack } from '../core/Spacer/Stack';
import { BaseM } from '../core/Text/Text';
import { SidebarView } from '../GalleryEditor/PiecesSidebar/SidebarViewSelector';
import { NftSelectorCollectionGroup } from './groupNftSelectorCollectionsByAddress';
import {
  NftSelectorFilterNetwork,
  NftSelectorNetworkView,
} from './NftSelectorFilter/NftSelectorFilterNetwork';
import {
  NftSelectorFilterSort,
  NftSelectorSortView,
} from './NftSelectorFilter/NftSelectorFilterSort';
import { NftSelectorViewSelector } from './NftSelectorFilter/NftSelectorViewSelector';
import { NftSelectorSearchBar } from './NftSelectorSearchBar';
import { NftSelectorView } from './NftSelectorView';

type Props = {
  queryRef: NftSelectorQueryFragment$key;
};

export type NftSelectorContractType = Omit<NftSelectorCollectionGroup, 'tokens'> | null;

export function NftSelector({ queryRef }: Props) {
  const tokens = useFragment(
    graphql`
      fragment NftSelectorQueryFragment on Token @relay(plural: true) {
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
    queryRef
  );

  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const debouncedSearchKeyword = useDebounce(searchKeyword, 200);

  const [selectedView, setSelectedView] = useState<SidebarView>('Collected');
  const [selectedSortView, setSelectedSortView] = useState<NftSelectorSortView>('Recently added');
  const [selectedNetworkView, setSelectedNetworkView] =
    useState<NftSelectorNetworkView>('All networks');

  const [selectedContract, setSelectedContract] = useState<NftSelectorContractType>(null);

  const handleResetSelectedContractAddress = useCallback(() => {
    setSelectedContract(null);
  }, []);

  const filteredTokens = useMemo(() => {
    let filteredTokens = [];

    // Filter by network
    if (selectedNetworkView === 'All networks') {
      filteredTokens = [...tokens];
    } else {
      filteredTokens = tokens.filter((token) => token.chain === selectedNetworkView);
    }

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
            <StyledTitleText>Select profile picture</StyledTitleText>
          </HStack>
        ) : (
          <StyledTitleText>Select profile picture</StyledTitleText>
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
          <HStack gap={8} align="center">
            <NftSelectorViewSelector
              selectedView={selectedView}
              onSelectedViewChange={setSelectedView}
            />
            <NftSelectorFilterSort
              selectedView={selectedSortView}
              onSelectedViewChange={setSelectedSortView}
            />
            <NftSelectorFilterNetwork
              selectedView={selectedNetworkView}
              onSelectedViewChange={setSelectedNetworkView}
            />
          </HStack>
        )}
      </StyledActionContainer>

      <NftSelectorView
        tokenRefs={filteredTokens}
        selectedContractAddress={selectedContract?.address ?? null}
        onSelectContract={setSelectedContract}
      />
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
