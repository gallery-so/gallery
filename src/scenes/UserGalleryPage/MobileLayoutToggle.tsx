import { DisplayLayout } from 'components/core/enums';
import { useCallback } from 'react';
import styled from 'styled-components';

type Props = {
  mobileLayout: DisplayLayout;
  setMobileLayout: (layout: DisplayLayout) => void;
};

function MobileLayoutToggle({ mobileLayout, setMobileLayout }: Props) {
  const handleGridClick = useCallback(() => {
    setMobileLayout(DisplayLayout.GRID);
  }, [setMobileLayout]);

  const handleListClick = useCallback(() => {
    setMobileLayout(DisplayLayout.LIST);
  }, [setMobileLayout]);

  return (
    <StyledMobileLayoutToggle>
      <StyledToggleButton onClick={handleGridClick} title="Grid view">
        <Icon src="/icons/grid_layout.svg" isSelected={mobileLayout === DisplayLayout.GRID} />
      </StyledToggleButton>
      <StyledToggleButton onClick={handleListClick} title="List view">
        <Icon src="/icons/list_layout.svg" isSelected={mobileLayout === DisplayLayout.LIST} />
      </StyledToggleButton>
    </StyledMobileLayoutToggle>
  );
}

const StyledMobileLayoutToggle = styled.div`
  display: flex;
  justify-content: flex-end;
`;
const StyledToggleButton = styled.button`
  background: none;
  border: 0;
`;

const Icon = styled.img<{ isSelected: boolean }>`
  width: 20px;
  height: 20px;
  opacity: ${({ isSelected }) => (isSelected ? 0.75 : 0.3)};
`;

export default MobileLayoutToggle;
