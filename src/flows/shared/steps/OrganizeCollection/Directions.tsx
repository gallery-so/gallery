import { memo } from 'react';
import styled from 'styled-components';

import { BaseXL, BaseM } from 'components/core/Text/Text';
import { FOOTER_HEIGHT } from 'flows/shared/components/WizardFooter/constants';

function Directions() {
  return (
    <DirectionsContainer>
      <StyledDirections>
        <StyledDirectionsTitle>Add NFTs to your collection</StyledDirectionsTitle>
        <BaseM>Select NFTs to include in your collection. Drag and drop to rearrange.</BaseM>
      </StyledDirections>
    </DirectionsContainer>
  );
}

const DirectionsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: calc(100vh - ${FOOTER_HEIGHT}px);
`;

const StyledDirections = styled.div`
  text-align: center;

  width: 269px;
`;

const StyledDirectionsTitle = styled(BaseXL)`
  font-weight: 700;
`;

export default memo(Directions);
