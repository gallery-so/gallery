import { memo } from 'react';
import styled from 'styled-components';

import { BaseXL, BaseM } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import colors from 'components/core/colors';
import { FOOTER_HEIGHT } from 'flows/shared/components/WizardFooter/WizardFooter';

function Directions() {
  return (
    <DirectionsContainer>
      <StyledDirections>
        <BaseXL>Add NFTs to your collection</BaseXL>
        <Spacer height={8} />
        <BaseM color={colors.metal}>
          Select NFTs to include in your collection. Drag and drop to rearrange.
        </BaseM>
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

export default memo(Directions);
