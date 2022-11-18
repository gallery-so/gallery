import { useCallback, useState } from 'react';
import styled from 'styled-components';

import colors from '~/components/core/colors';
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
      <Selector isDropdownOpen={isDropdownOpen} onClick={() => setIsDropdownOpen(true)}>
        <BaseM>{selectedView}</BaseM>
        <DoubleArrowsIcon />
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
`;

const Selector = styled.div<{ isDropdownOpen: boolean }>`
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  padding: 8px 12px;
  align-items: center;

  ${({ isDropdownOpen }) => isDropdownOpen && `background-color: ${colors.faint};`}

  &:hover {
    background-color: ${colors.faint};
  }
`;
