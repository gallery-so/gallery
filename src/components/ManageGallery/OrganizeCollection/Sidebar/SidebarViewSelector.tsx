import Arrows from 'public/icons/arrows.svg';
import { useState } from 'react';
import styled from 'styled-components';

import { Dropdown } from '~/components/core/Dropdown/Dropdown';
import { DropdownItem } from '~/components/core/Dropdown/DropdownItem';
import { DropdownSection } from '~/components/core/Dropdown/DropdownSection';
import { BaseM } from '~/components/core/Text/Text';

export type SidebarView = 'Collected' | 'Hidden';

type SidebarViewSelectorProps = {
  selectedView: SidebarView;
  setSelectedView: (selectedView: SidebarView) => void;
};

export function SidebarViewSelector({ selectedView, setSelectedView }: SidebarViewSelectorProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const onSelectView = (selectedView: SidebarView) => {
    setSelectedView(selectedView);
    setIsDropdownOpen(false);
  };

  return (
    <Container>
      <Selector onClick={() => setIsDropdownOpen(true)}>
        <BaseM>{selectedView}</BaseM>
        <Arrows style={{ marginRight: 4 }} />
      </Selector>
      <Dropdown
        position="right"
        active={isDropdownOpen}
        onClose={() => setIsDropdownOpen(false)}
        style={{ width: '100%' }}
      >
        <DropdownSection>
          <DropdownItem onClick={() => onSelectView('Collected')}>Collected</DropdownItem>
          <DropdownItem onClick={() => onSelectView('Hidden')}>Hidden</DropdownItem>
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
