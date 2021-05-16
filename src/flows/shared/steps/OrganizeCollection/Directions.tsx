import { memo } from 'react';
import styled from 'styled-components';

import { Heading, BodyRegular } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import colors from 'components/core/colors';
import { FOOTER_HEIGHT } from 'flows/shared/components/WizardFooter/WizardFooter';

function Directions() {
  return (
    <DirectionsContainer>
      <StyledDirections>
        <Heading>Add NFTs to your collection</Heading>
        <Spacer height={8} />
        <BodyRegular color={colors.gray50}>
          Select NFTs to include in your collection. Drag and drop to rearrange.
        </BodyRegular>
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
