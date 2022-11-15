import { useCallback, useState } from 'react';
import styled from 'styled-components';

import { Dropdown } from '~/components/core/Dropdown/Dropdown';
import { DropdownItem } from '~/components/core/Dropdown/DropdownItem';
import { DropdownSection } from '~/components/core/Dropdown/DropdownSection';
import { BaseM } from '~/components/core/Text/Text';
import DoubleArrowsIcon from '~/icons/DoubleArrowsIcon';

export type SidebarView = 'Collected' | 'Hidden';

type SidebarViewSelectorProps = {
  selectedView: SidebarView;
  setSelectedView: (selectedView: SidebarView) => void;
};

export function SidebarViewSelector({ selectedView, setSelectedView }: SidebarViewSelectorProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const onSelectView = useCallback(
    (selectedView: SidebarView) => {
      setSelectedView(selectedView);
      setIsDropdownOpen(false);
    },
    [setSelectedView, setIsDropdownOpen]
  );

  return (
    <Container>
      <Selector onClick={() => setIsDropdownOpen(true)}>
        <BaseM>{selectedView}</BaseM>
        <StyledArrowsIcon />
      </Selector>
      <Dropdown
        position="full-width"
        active={isDropdownOpen}
        onClose={() => setIsDropdownOpen(false)}
      >
        <DropdownSection>
          <DropdownItem onClick={() => onSelectView('Collected')}>COLLECTED</DropdownItem>
          <DropdownItem onClick={() => onSelectView('Hidden')}>HIDDEN</DropdownItem>
        </DropdownSection>
      </Dropdown>
    </Container>
  );
}

const Container = styled.div`
  position: relative;
  padding-top: 16px;
`;

const Selector = styled.div`
  display: flex;
  justify-content: space-between;
  cursor: pointer;
`;

const StyledArrowsIcon = styled(DoubleArrowsIcon)`
  margin-right: 4px;
`;
