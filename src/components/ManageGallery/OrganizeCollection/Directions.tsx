import { memo } from 'react';
import styled from 'styled-components';
import { EmptyState } from 'components/EmptyState/EmptyState';
import { VStack } from 'components/core/Spacer/Stack';

function Directions() {
  return (
    <DirectionsContainer align="center" justify="center">
      <StyledDirections>
        <EmptyState
          title="Add NFTs to your collection"
          description="Select NFTs to include in your collection. Drag and drop to rearrange."
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
