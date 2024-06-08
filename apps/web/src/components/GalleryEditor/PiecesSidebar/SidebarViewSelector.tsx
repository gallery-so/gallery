import { useCallback, useState } from 'react';
import styled from 'styled-components';

import { Dropdown } from '~/components/core/Dropdown/Dropdown';
import { DropdownItem } from '~/components/core/Dropdown/DropdownItem';
import { DropdownSection } from '~/components/core/Dropdown/DropdownSection';
import IconContainer from '~/components/core/IconContainer';
import { HStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import DoubleArrowsIcon from '~/icons/DoubleArrowsIcon';
import { contexts } from '~/shared/analytics/constants';
import { useTrack } from '~/shared/contexts/AnalyticsContext';

export type TokenFilterType = 'Collected' | 'Created' | 'Hidden';

type SidebarViewSelectorProps = {
  isSearching: boolean;
  selectedView: TokenFilterType;
  onSelectedViewChange: (selectedView: TokenFilterType) => void;
  isAllNetworksSelected: boolean;
};

export function SidebarViewSelector({
  isSearching,
  selectedView,
  onSelectedViewChange,
  isAllNetworksSelected,
}: SidebarViewSelectorProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const track = useTrack();

  const onSelectView = useCallback(
    (selectedView: TokenFilterType) => {
      track('Editor Sidebar Dropdown Clicked', { variant: selectedView });
      onSelectedViewChange(selectedView);
      setIsDropdownOpen(false);
    },
    [track, onSelectedViewChange]
  );

  return (
    <Container>
      <Selector gap={10} align="center" onClick={() => setIsDropdownOpen(true)}>
        <BaseM>{isSearching ? 'All' : selectedView}</BaseM>
        <IconContainer variant="stacked" size="sm" icon={<DoubleArrowsIcon />} />
      </Selector>
      <StyledDropdown
        position="right"
        active={isDropdownOpen}
        onClose={() => setIsDropdownOpen(false)}
      >
        <DropdownSection>
          <DropdownItem
            onClick={() => onSelectView('Collected')}
            name="Token Type"
            eventContext={contexts.Editor}
            label="Collected"
          />
          <DropdownItem
            onClick={() => onSelectView('Created')}
            name="Token Type"
            eventContext={contexts.Editor}
            label="Created"
            disabled={isAllNetworksSelected}
          />
          <DropdownItem
            onClick={() => onSelectView('Hidden')}
            name="Token Type"
            eventContext={contexts.Editor}
            label="Hidden"
            disabled={isAllNetworksSelected}
          />
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
