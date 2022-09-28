import colors from 'components/core/colors';
import { DisplayLayout } from 'components/core/enums';
import styled from 'styled-components';

const GridLayoutIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 3V21" stroke="currentColor" stroke-miterlimit="10" />
    <path d="M9 3V21" stroke="currentColor" stroke-miterlimit="10" />
    <path d="M21 3H3V21H21V3Z" stroke="currentColor" />
    <path d="M21 15H3" stroke="currentColor" stroke-miterlimit="10" />
    <path d="M21 9H3" stroke="currentColor" stroke-miterlimit="10" />
  </svg>
);

const ListLayoutIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 6H21" stroke="currentColor" stroke-miterlimit="10" />
    <path d="M8 12H21" stroke="currentColor" stroke-miterlimit="10" />
    <path d="M8 18H21" stroke="currentColor" stroke-miterlimit="10" />
    <path d="M3 6H4.5" stroke="currentColor" />
    <path d="M3 12H4.5" stroke="currentColor" />
    <path d="M3 18H4.5" stroke="currentColor" />
  </svg>
);

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

  const isGrid = layout === DisplayLayout.GRID;

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
