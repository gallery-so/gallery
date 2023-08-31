import { useCallback, useState } from 'react';
import styled from 'styled-components';

import DoubleArrowsIcon from '~/icons/DoubleArrowsIcon';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import colors from '~/shared/theme/colors';

import { Dropdown } from '../../core/Dropdown/Dropdown';
import { DropdownItem } from '../../core/Dropdown/DropdownItem';
import { DropdownSection } from '../../core/Dropdown/DropdownSection';
import IconContainer from '../../core/IconContainer';
import { HStack } from '../../core/Spacer/Stack';
import { BaseM } from '../../core/Text/Text';
import { TokenFilterType } from '../../GalleryEditor/PiecesSidebar/SidebarViewSelector';

type NftSelectorViewSelectorProps = {
  selectedView: TokenFilterType;
  onSelectedViewChange: (selectedView: TokenFilterType) => void;
};

export function NftSelectorViewSelector({
  selectedView,
  onSelectedViewChange,
}: NftSelectorViewSelectorProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const track = useTrack();

  const onSelectView = useCallback(
    (selectedView: TokenFilterType) => {
      track('NFT Selector: Changed View Filter', { variant: selectedView });
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
          <DropdownItem onClick={() => onSelectView('Collected')}>
            <BaseM>Collected</BaseM>
          </DropdownItem>
          <DropdownItem onClick={() => onSelectView('Created')}>
            <BaseM>Created</BaseM>
          </DropdownItem>
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
