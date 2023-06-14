import { useCallback,useState } from 'react';
import styled from 'styled-components';

import DoubleArrowsIcon from '~/icons/DoubleArrowsIcon';
import { useTrack } from '~/shared/contexts/AnalyticsContext';

import { Dropdown } from '../../core/Dropdown/Dropdown';
import { DropdownItem } from '../../core/Dropdown/DropdownItem';
import { DropdownSection } from '../../core/Dropdown/DropdownSection';
import IconContainer from '../../core/IconContainer';
import { HStack } from '../../core/Spacer/Stack';
import { BaseM } from '../../core/Text/Text';
import { SidebarView } from '../../GalleryEditor/PiecesSidebar/SidebarViewSelector';

type NftSelectorViewSelectorProps = {
  selectedView: SidebarView;
  onSelectedViewChange: (selectedView: SidebarView) => void;
};

export function NftSelectorViewSelector({
  selectedView,
  onSelectedViewChange,
}: NftSelectorViewSelectorProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const track = useTrack();

  const onSelectView = useCallback(
    (selectedView: SidebarView) => {
      track('Nft Selector Dropdown Clicked', { variant: selectedView });
      if (selectedView === 'Created') {
        return;
      }
      onSelectedViewChange(selectedView);
      setIsDropdownOpen(false);
    },
    [track, onSelectedViewChange]
  );

  return (
    <Container>
      <Selector gap={10} align="center" onClick={() => setIsDropdownOpen(true)}>
        <BaseM>{selectedView}</BaseM>
        <IconContainer variant="stacked" size="sm" icon={<DoubleArrowsIcon />} />
      </Selector>
      <Dropdown position="right" active={isDropdownOpen} onClose={() => setIsDropdownOpen(false)}>
        <DropdownSection>
          <DropdownItem onClick={() => onSelectView('Collected')}>COLLECTED</DropdownItem>
          <DropdownItem onClick={() => onSelectView('Hidden')}>HIDDEN</DropdownItem>
          <DropdownItem onClick={() => onSelectView('Created')}>CREATED (SOON)</DropdownItem>
        </DropdownSection>
      </Dropdown>
    </Container>
  );
}

const Selector = styled(HStack)`
  cursor: pointer;
`;

const Container = styled.div`
  position: relative;
`;
