import colors from 'components/core/colors';
import { DisplayLayout } from 'components/core/enums';
import { useMemo } from 'react';
import { GridLayoutIcon, ListLayoutIcon } from 'scenes/UserGalleryPage/MobileLayoutToggle';
import styled from 'styled-components';

type Props = {
  layout: DisplayLayout;
  setLayout: (layout: DisplayLayout) => void;
};

export default function LayoutToggleButton({ layout, setLayout }: Props) {
  const handleGridClick = () => {
    setLayout(DisplayLayout.GRID);
  };

  const handleListClick = () => {
    setLayout(DisplayLayout.LIST);
  };

  const isGrid = useMemo(() => layout === DisplayLayout.GRID, [layout]);

  return (
    <StyledLayoutToggleButtonContainer>
      <StyledToggleButton active={isGrid} onClick={handleGridClick}>
        <GridLayoutIcon />
      </StyledToggleButton>
      <StyledToggleButton active={!isGrid} onClick={handleListClick}>
        <ListLayoutIcon />
      </StyledToggleButton>
    </StyledLayoutToggleButtonContainer>
  );
}

const StyledLayoutToggleButtonContainer = styled.div`
  display: flex;
  border: 1px solid ${colors.faint};
  background-color: ${colors.faint};
`;

const StyledToggleButton = styled.button<{ active?: boolean }>`
  background-color: ${({ active }) => (active ? colors.white : colors.faint)};
  padding: 4px;
  appearance: none;
  border: none;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    color: ${({ active }) => (active ? colors.offBlack : colors.metal)};
  }
`;
