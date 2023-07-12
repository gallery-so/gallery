import { useCallback, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { Dropdown } from '~/components/core/Dropdown/Dropdown';
import { DropdownItem } from '~/components/core/Dropdown/DropdownItem';
import { DropdownSection } from '~/components/core/Dropdown/DropdownSection';
import IconContainer from '~/components/core/IconContainer';
import { HStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import DoubleArrowsIcon from '~/icons/DoubleArrowsIcon';
import { SelectWalletSidebarQueryFragment$key } from '~/generated/SelectWalletSidebarQueryFragment.graphql';
import { useTrack } from '~/shared/contexts/AnalyticsContext';

export type SidebarWallet = string;

type SidebarWalletSelectorProps = {
  queryRef: SelectWalletSidebarQueryFragment$key;
  selectedWallet: SidebarWallet;
  onSelectedWalletChange: (selectedWallet: string) => void;
};

export function SidebarWalletSelector({
  queryRef,
  selectedWallet,
  onSelectedWalletChange,
}: SidebarWalletSelectorProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { viewer } = useFragment(
    graphql`
      fragment SelectWalletSidebarQueryFragment on Query {
        ...ManageWalletsModalFragment
      }
    `,
    queryRef
  );
  console.log("viewer", viewer);
  const track = useTrack();

  const onSelectWallet = useCallback(
    (selectedWallet: SidebarWallet) => {
      track('Editor Sidebar Wallet Dropdown Clicked', { variant: selectedWallet });
      onSelectedWalletChange(selectedWallet);
      setIsDropdownOpen(false);
    },
    [track, onSelectedWalletChange]
  );

  return (
    <Container>
      <Selector gap={10} align="center" onClick={() => setIsDropdownOpen(true)}>
        <BaseM>{selectedWallet}</BaseM>
        <IconContainer variant="stacked" size="sm" icon={<DoubleArrowsIcon />} />
      </Selector>
      <StyledDropdown
        position="right"
        active={isDropdownOpen}
        onClose={() => setIsDropdownOpen(false)}
      >
        <DropdownSection>
          <DropdownItem onClick={() => onSelectWallet('ALL')}>
            <BaseM>ALL</BaseM>
          </DropdownItem>
          <DropdownItem onClick={() => onSelectWallet('0x5f97a3r1')}>
            <BaseM>0x5f97a3r1</BaseM>
          </DropdownItem>
          <DropdownItem onClick={() => onSelectWallet('0x97s4s301')}>
            <BaseM>0x97s4s301</BaseM>
          </DropdownItem>
        </DropdownSection>
      </StyledDropdown>
    </Container>
  );
}

const Selector = styled(HStack)`
  cursor: pointer;
`;

const Container = styled.div`
  position: relative;
`;

const StyledDropdown = styled(Dropdown)`
  width: 100px;
`;
