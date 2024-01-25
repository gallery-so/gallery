import { useCallback, useMemo } from 'react';
import { contexts } from 'shared/analytics/constants';
import { useTrack } from 'shared/contexts/AnalyticsContext';
import styled from 'styled-components';

import { DisplayLayout } from '~/components/core/enums';
import { GridLayoutIcon, ListLayoutIcon } from '~/scenes/UserGalleryPage/MobileLayoutToggle';
import colors from '~/shared/theme/colors';

type Props = {
  layout: DisplayLayout;
  setLayout: (layout: DisplayLayout) => void;
};

export default function LayoutToggleButton({ layout, setLayout }: Props) {
  const track = useTrack();

  const handleGridClick = useCallback(() => {
    setLayout(DisplayLayout.GRID);
    track('Grid layout Click', {
      id: 'Grid Layout Switcher',
      name: 'Grid Layout Switcher',
      context: contexts.Community,
    });
  }, [setLayout, track]);

  const handleListClick = useCallback(() => {
    setLayout(DisplayLayout.LIST);
    track('List layout Click', {
      id: 'List Layout Switcher',
      name: 'List Layout Switcher',
      context: contexts.Community,
    });
  }, [setLayout, track]);

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
    color: ${({ active }) => (active ? colors.black['800'] : colors.shadow)};
  }
`;
