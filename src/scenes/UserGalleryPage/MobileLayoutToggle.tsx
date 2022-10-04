import colors from 'components/core/colors';
import { DisplayLayout } from 'components/core/enums';
import { useCallback } from 'react';
import styled from 'styled-components';

type Props = {
  mobileLayout: DisplayLayout;
  setMobileLayout: (layout: DisplayLayout) => void;
};

export const ListLayoutIcon = () => (
  // Although the svg has a height and width of 24, it is actually 18px (per Figma)
  // Notice how the path elements begin at 21; there is simply padding around the icon
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g>
      <path d="M21 3H3V21H21V3Z" />
      <path d="M21 15H3" strokeMiterlimit="10" />
      <path d="M21 9H3" strokeMiterlimit="10" />
    </g>
  </svg>
);

export const GridLayoutIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M15 3V21" strokeMiterlimit="10" />
    <path d="M9 3V21" strokeMiterlimit="10" />
    <path d="M21 3H3V21H21V3Z" />
    <path d="M21 15H3" strokeMiterlimit="10" />
    <path d="M21 9H3" strokeMiterlimit="10" />
  </svg>
);

function MobileLayoutToggle({ mobileLayout, setMobileLayout }: Props) {
  const handleGridClick = useCallback(() => {
    setMobileLayout(DisplayLayout.LIST);
  }, [setMobileLayout]);

  const handleListClick = useCallback(() => {
    setMobileLayout(DisplayLayout.GRID);
  }, [setMobileLayout]);

  return mobileLayout === DisplayLayout.GRID ? (
    <StyledToggleButton onClick={handleGridClick} title="Grid view">
      <ListLayoutIcon />
    </StyledToggleButton>
  ) : (
    <StyledToggleButton onClick={handleListClick} title="List view">
      <GridLayoutIcon />
    </StyledToggleButton>
  );
}

const StyledToggleButton = styled.button`
  background: none;
  border: 0;
  cursor: pointer;
  padding: 0;
  height: 24px;
  width: 24px;

  & svg path {
    stroke: ${colors.offBlack};
  }
`;

export default MobileLayoutToggle;
