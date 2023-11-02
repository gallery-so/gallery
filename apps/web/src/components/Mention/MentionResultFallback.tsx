import styled from 'styled-components';

import colors from '~/shared/theme/colors';

import { pulseAnimation } from '../core/keyframes';
import { HStack, VStack } from '../core/Spacer/Stack';
import transitions from '../core/transitions';

export function MentionResultFallback() {
  return (
    <StyledWrapper>
      <VStack gap={10}>
        <StyledTitleFallback />
        <VStack>
          <ResultItemFallback />
          <ResultItemFallback />
          <ResultItemFallback />
          <ResultItemFallback />
        </VStack>
      </VStack>
      <VStack gap={10}>
        <StyledTitleFallback />
        <VStack>
          <ResultItemFallback />
          <ResultItemFallback />
          <ResultItemFallback />
          <ResultItemFallback />
        </VStack>
      </VStack>
    </StyledWrapper>
  );
}

function ResultItemFallback() {
  return (
    <StyledResultItemFallback gap={4}>
      <StyledResultItemPfpFallback />
      <VStack grow gap={4}>
        <StyledResultItemNameFallback />
        <StyledResultItemDescriptionFallback />
      </VStack>
    </StyledResultItemFallback>
  );
}

const StyledFallback = styled.div`
  animation: ${pulseAnimation} ${transitions.pulse} infinite;
`;

const StyledWrapper = styled.div`
  padding: 8px;
`;

const StyledTitleFallback = styled(StyledFallback)`
  padding: 0 8px;

  background-color: ${colors.porcelain};
  height: 16px;
  width: 64px;
`;

const StyledResultItemFallback = styled(HStack)`
  padding: 8px 0;

  width: 100%;
`;

const StyledResultItemPfpFallback = styled(StyledFallback)`
  height: 32px;
  width: 32px;
  border-radius: 50%;
  background-color: ${colors.porcelain};
`;

const StyledResultItemNameFallback = styled(StyledFallback)`
  height: 16px;
  width: 40px;
  background-color: ${colors.porcelain};
`;

const StyledResultItemDescriptionFallback = styled(StyledFallback)`
  height: 16px;
  width: 100%;
  background-color: ${colors.porcelain};
`;
