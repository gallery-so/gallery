import { useState } from 'react';
import styled from 'styled-components';

import SearchIcon from '~/icons/SearchIcon';
import colors from '~/shared/theme/colors';

import { HStack, VStack } from '../core/Spacer/Stack';
import { BaseM } from '../core/Text/Text';
import { SidebarView } from '../GalleryEditor/PiecesSidebar/SidebarViewSelector';
import {
  NftSelectorFilterNetwork,
  NftSelectorNetworkView,
} from './NftSelectorFilter/NftSelectorFilterNetwork';
import {
  NftSelectorFilterSort,
  NftSelectorSortView,
} from './NftSelectorFilter/NftSelectorFilterSort';
import { NftSelectorViewSelector } from './NftSelectorFilter/NftSelectorViewSelector';

export function NftSelector() {
  const [selectedView, setSelectedView] = useState<SidebarView>('Collected');
  const [selectedSortView, setSelectedSortView] = useState<NftSelectorSortView>('Recently added');
  const [selectedNetworkView, setSelectedNetworkView] =
    useState<NftSelectorNetworkView>('All networks');

  return (
    <StyledNftSelectorModal>
      <StyledTitle>
        <StyledTitleText>Select an NFT</StyledTitleText>
      </StyledTitle>

      <HStack gap={16} justify="space-between">
        <StyledInputContainer align="center" gap={10}>
          <SearchIcon />
          <StyledInputSearch
            type="text"
            autoComplete="off"
            autoCorrect="off"
            placeholder="Search collection"
          />
        </StyledInputContainer>
        <HStack gap={8}>
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
      </HStack>
    </StyledNftSelectorModal>
  );
}

const StyledNftSelectorModal = styled(VStack)`
  width: 880px;
  min-height: 250px;
`;

const StyledTitle = styled.div`
  padding: 16px 0;
`;
const StyledTitleText = styled(BaseM)`
  font-weight: 700;
`;

const StyledInputContainer = styled(HStack)`
  padding: 4px 8px;
  background-color: ${colors.offWhite};
  flex: 1;
`;

const StyledInputSearch = styled.input`
  width: 100%;

  border: none;
  padding: 0;

  background-color: transparent;

  color: ${colors.metal};

  &::placeholder {
    color: ${colors.porcelain};
  }
`;
