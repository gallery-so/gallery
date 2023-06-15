import { useCallback, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { NftSelectorQueryFragment$key } from '~/generated/NftSelectorQueryFragment.graphql';
import SearchIcon from '~/icons/SearchIcon';
import colors from '~/shared/theme/colors';

import { Button } from '../core/Button/Button';
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
import { NftSelectorView } from './NftSelectorView';

type Props = {
  queryRef: NftSelectorQueryFragment$key;
};

export function NftSelector({ queryRef }: Props) {
  const tokens = useFragment(
    graphql`
      fragment NftSelectorQueryFragment on Token @relay(plural: true) {
        ...NftSelectorViewFragment
      }
    `,
    queryRef
  );

  const [selectedView, setSelectedView] = useState<SidebarView>('Collected');
  const [selectedSortView, setSelectedSortView] = useState<NftSelectorSortView>('Recently added');
  const [selectedNetworkView, setSelectedNetworkView] =
    useState<NftSelectorNetworkView>('All networks');

  const [selectedContractAddress, setSelectedContractAddress] = useState<string | null>(null);

  const handleResetSelectedContractAddress = useCallback(() => {
    setSelectedContractAddress(null);
  }, []);
  return (
    <StyledNftSelectorModal>
      <StyledTitle>
        <StyledTitleText>Select an NFT</StyledTitleText>
      </StyledTitle>

      <StyledActionContainer gap={16} justify="space-between">
        {!selectedContractAddress && (
          <StyledInputContainer align="center" gap={10}>
            <SearchIcon />
            <StyledInputSearch
              type="text"
              autoComplete="off"
              autoCorrect="off"
              placeholder="Search collection"
            />
          </StyledInputContainer>
        )}
        <HStack gap={8} align="center">
          {selectedContractAddress && (
            // TODO: Temporary button while finalize design
            <StyledButton onClick={handleResetSelectedContractAddress} variant="secondary">
              Back
            </StyledButton>
          )}
          {!selectedContractAddress && (
            <NftSelectorViewSelector
              selectedView={selectedView}
              onSelectedViewChange={setSelectedView}
            />
          )}

          <NftSelectorFilterSort
            selectedView={selectedSortView}
            onSelectedViewChange={setSelectedSortView}
          />

          {!selectedContractAddress && (
            <NftSelectorFilterNetwork
              selectedView={selectedNetworkView}
              onSelectedViewChange={setSelectedNetworkView}
            />
          )}
        </HStack>
      </StyledActionContainer>

      <NftSelectorView
        tokenRefs={tokens}
        selectedContractAddress={selectedContractAddress}
        onSelectContractAddress={setSelectedContractAddress}
      />
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
const StyledActionContainer = styled(HStack)`
  padding-bottom: 16px;
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

const StyledButton = styled(Button)`
  height: 30px;
  width: 70px;
`;
