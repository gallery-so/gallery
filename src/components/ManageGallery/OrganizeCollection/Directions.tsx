import { memo } from 'react';
import styled from 'styled-components';

import { VStack } from '~/components/core/Spacer/Stack';
import { EmptyState } from '~/components/EmptyState/EmptyState';

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
  height: 100%;
`;

const StyledDirections = styled.div`
  text-align: center;
  max-width: 269px;
`;

export default memo(Directions);
