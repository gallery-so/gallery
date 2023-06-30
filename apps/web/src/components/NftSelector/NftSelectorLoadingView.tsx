import styled from 'styled-components';

import colors from '~/shared/theme/colors';

import { VStack } from '../core/Spacer/Stack';
import { Spinner } from '../core/Spinner/Spinner';
import { BaseXL, TitleL } from '../core/Text/Text';

const TOTAL_GRID = 12;

export function NftSelectorLoadingView() {
  return (
    <StyledWrapper align="center">
      <GridContainer>
        {Array.from({ length: TOTAL_GRID }).map((_, index) => (
          <Grid key={index} />
        ))}
      </GridContainer>

      <StyledTextContainer gap={32} align="center" justify="center">
        <VStack gap={16} align="center">
          <StyledTitle>Fetching your collection</StyledTitle>
          <BaseXL>This may take a minute</BaseXL>
        </VStack>
        <Spinner />
      </StyledTextContainer>
    </StyledWrapper>
  );
}

const StyledWrapper = styled(VStack)`
  position: relative;
  height: 500px;
  padding-top: 8px;
  overflow: hidden;
`;

const StyledTitle = styled(TitleL)`
  font-style: italic;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
`;

const Grid = styled.div`
  height: 208px;
  width: 208px;
  background-color: ${colors.offWhite};
`;

const StyledTextContainer = styled(VStack)`
  position: absolute;
  z-index: 2;
  width: 100%;
  height: 100%;
`;
