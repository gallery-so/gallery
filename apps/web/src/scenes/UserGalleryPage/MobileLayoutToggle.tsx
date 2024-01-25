import { useCallback } from 'react';
import styled from 'styled-components';

import { DisplayLayout } from '~/components/core/enums';
import colors from '~/shared/theme/colors';

type Props = {
  mobileLayout: DisplayLayout;
  setMobileLayout: (layout: DisplayLayout) => void;
};

export const ListLayoutIcon = () => (
  // Although the svg has a height and width of 24, it is actually 18px (per Figma)
  // Notice how the path elements begin at 21; there is simply padding around the icon
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
  >
    <path d="M5.3335 4H14.0002" stroke-miterlimit="10" />
    <path d="M5.3335 8H14.0002" stroke-miterlimit="10" />
    <path d="M5.3335 12H14.0002" stroke-miterlimit="10" />
    <path d="M2 4H3" />
    <path d="M2 8H3" />
    <path d="M2 12H3" />
  </svg>
);

export const GridLayoutIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
  >
    <path d="M10 2V14" stroke-miterlimit="10" />
    <path d="M6 2V14" stroke-miterlimit="10" />
    <path d="M14 2H2V14H14V2Z" />
    <path d="M14 10H2" stroke-miterlimit="10" />
    <path d="M14 6H2" stroke-miterlimit="10" />
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
    stroke: ${colors.black['800']};
  }
`;

export default MobileLayoutToggle;
