import { memo } from 'react';
import styled from 'styled-components';
import { FOOTER_HEIGHT } from 'components/Onboarding/constants';
import { EmptyState } from 'components/EmptyState/EmptyState';
import { VStack } from 'components/core/Spacer/Stack';

function Directions() {
  return (
    <DirectionsContainer align="center" justify="center">
      <StyledDirections>
        <EmptyState
          title="Add pieces to your collection"
          description="Select pieces to include in your collection. Drag and drop to rearrange."
        />
      </StyledDirections>
    </DirectionsContainer>
  );
}

const DirectionsContainer = styled(VStack)`
  width: 100%;
  height: calc(100vh - ${FOOTER_HEIGHT}px);
`;

const StyledDirections = styled.div`
  text-align: center;
  max-width: 269px;
`;

export default memo(Directions);
