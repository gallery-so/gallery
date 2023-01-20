import styled, { keyframes } from 'styled-components';

import colors from '~/components/core/colors';

export default function Blinking() {
  return (
    <StyledBlinkingContainer>
      <StyledOuterBlinking />
      <StyledBlinking />
    </StyledBlinkingContainer>
  );
}

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
