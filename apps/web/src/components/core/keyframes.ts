import { keyframes } from 'styled-components';

export const fadeIn = keyframes`
  from { opacity: 0; };
  to { opacity: 1; };
`;

export const fadeOut = keyframes`
  from { opacity: 1; };
  to { opacity: 0; };
`;

export const pulseAnimation = keyframes`
50% {
    opacity: 0.5;
}
`;
