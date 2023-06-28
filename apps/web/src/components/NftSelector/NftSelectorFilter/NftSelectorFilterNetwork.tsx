import { useCallback, useState } from 'react';
import styled from 'styled-components';

import { BaseM } from '~/components/core/Text/Text';
import DoubleArrowsIcon from '~/icons/DoubleArrowsIcon';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import colors from '~/shared/theme/colors';

import { Dropdown } from '../../core/Dropdown/Dropdown';
import { DropdownItem } from '../../core/Dropdown/DropdownItem';
import { DropdownSection } from '../../core/Dropdown/DropdownSection';
import IconContainer from '../../core/IconContainer';
import { HStack } from '../../core/Spacer/Stack';

export type NftSelectorNetworkView = 'Ethereum' | 'Tezos' | 'POAP';

type NftSelectorViewSelectorProps = {
  selectedView: NftSelectorNetworkView;
  onSelectedViewChange: (selectedView: NftSelectorNetworkView) => void;
};

const StyledLogo = styled.img`
  height: 16px;
  width: 16px;
`;

type NetworkDropdownProps = {
  option: NftSelectorNetworkView;
};

const NetworkDropdownByNetwork = ({ option }: NetworkDropdownProps) => {
  switch (option) {
    case 'Ethereum':
      return (
        <HStack gap={4} align="center">
          <StyledLogo src="/icons/ethereum_logo.svg" alt="Ethereum logo" />
          <BaseM>Ethereum</BaseM>
        </HStack>
      );
    case 'Tezos':
      return (
        <HStack gap={4} align="center">
          <StyledLogo src="/icons/tezos_logo.svg" alt="Tezos logo" />
          <BaseM>Tezos</BaseM>
        </HStack>
      );
    case 'POAP':
      return (
        <HStack gap={4} align="center">
          <StyledLogo src="/icons/poap_logo.svg" alt="POAP logo" />
          <BaseM>POAP</BaseM>
        </HStack>
      );
    default:
      return <div />;
  }
};

const options: NftSelectorNetworkView[] = ['Ethereum', 'Tezos', 'POAP'];

export function NftSelectorFilterNetwork({
  selectedView,
  onSelectedViewChange,
}: NftSelectorViewSelectorProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const track = useTrack();

  const onSelectView = useCallback(
    (selectedView: NftSelectorNetworkView) => {
      track('Nft Selector Network Dropdown Clicked', { variant: selectedView });
      onSelectedViewChange(selectedView);
      setIsDropdownOpen(false);
    },
    [track, onSelectedViewChange]
  );

  return (
    <Container>
      <Selector gap={10} align="center" onClick={() => setIsDropdownOpen(true)}>
        <NetworkDropdownByNetwork option={selectedView} />
        <IconContainer variant="stacked" size="sm" icon={<DoubleArrowsIcon />} />
      </Selector>
      <Dropdown position="right" active={isDropdownOpen} onClose={() => setIsDropdownOpen(false)}>
        <DropdownSection>
          {options.map((option) => (
            <DropdownItem key={option} onClick={() => onSelectView(option)}>
              <NetworkDropdownByNetwork option={option} />
            </DropdownItem>
          ))}
        </DropdownSection>
      </Dropdown>
    </Container>
  );
}

const Selector = styled(HStack)`
  cursor: pointer;
  padding: 4px 8px;

  &:hover {
    background-color: ${colors.faint};
  }
`;

const Container = styled.div`
  position: relative;
`;
