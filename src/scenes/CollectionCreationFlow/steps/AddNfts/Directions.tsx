import { memo } from 'react';
import styled from 'styled-components';

import { Subtitle, Text } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import colors from 'components/core/colors';
import { FOOTER_HEIGHT } from 'scenes/CollectionCreationFlow/WizardFooter';

function Directions() {
  return (
    <DirectionsContainer>
      <StyledDirections>
        <Subtitle>Add NFTs to your collection</Subtitle>
        <Spacer height={12} />
        <Text color={colors.gray50}>
          On the left, select the NFTs you’d like to include in this collection.
          Once added, drag and drop to re-order.
        </Text>
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
