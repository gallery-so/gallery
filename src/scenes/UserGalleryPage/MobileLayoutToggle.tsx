import { DisplayLayout } from 'components/core/enums';
import { useCallback } from 'react';
import styled from 'styled-components';

type Props = {
  mobileLayout: DisplayLayout;
  setMobileLayout: (layout: DisplayLayout) => void;
};

function MobileLayoutToggle({ mobileLayout, setMobileLayout }: Props) {
  const handleGridClick = useCallback(() => {
    setMobileLayout(DisplayLayout.LIST);
  }, [setMobileLayout]);

  const handleListClick = useCallback(() => {
    setMobileLayout(DisplayLayout.GRID);
  }, [setMobileLayout]);

  return mobileLayout === DisplayLayout.GRID ? (
    <StyledToggleButton onClick={handleGridClick} title="Grid view">
      <Icon src="/icons/list_layout.svg" />
    </StyledToggleButton>
  ) : (
    <StyledToggleButton onClick={handleListClick} title="List view">
      <Icon src="/icons/grid_layout.svg" />
    </StyledToggleButton>
  );
}

const StyledToggleButton = styled.button`
  background: none;
  border: 0;
  margin-top: 12px;
`;

const Icon = styled.img`
  width: 20px;
  height: 20px;
  opacity: 0.25;
  pointer-events: none;
  // prevent "save image" popup when holding down on icon
  -webkit-touch-callout: none;
`;

export default MobileLayoutToggle;
