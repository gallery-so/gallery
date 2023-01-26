import { forwardRef } from 'react';
import styled, { keyframes } from 'styled-components';

import colors from '~/components/core/colors';

const Blinking = forwardRef<HTMLSpanElement, Record<string, unknown>>(({}, ref) => (
  <StyledBlinkingContainer ref={ref}>
    <StyledOuterBlinking />
    <StyledBlinking />
  </StyledBlinkingContainer>
));

const blinking = keyframes`
    50% {
        opacity: 0;
        transform: scale(2);
    }
    75% {
        opacity: 0;
        transform: scale(3);
    }

`;

const StyledBlinkingContainer = styled.span`
  height: 8px;
  width: 8px;
  position: relative;
`;

const StyledOuterBlinking = styled.span`
  height: 8px;
  width: 8px;
  display: block;
  position: absolute;

  border-radius: 50%;
  background-color: ${colors.activeBlue};
  opacity: 0.24;
  animation: ${blinking} 800ms linear infinite;
`;

const StyledBlinking = styled.span`
  height: 8px;
  width: 8px;
  border-radius: 50%;
  background-color: ${colors.activeBlue};
  display: block;
`;

Blinking.displayName = 'Blinking';
export default Blinking;
