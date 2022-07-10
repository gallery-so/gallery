import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export const Spinner = styled.span`
  display: inline-flex;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;

  width: 1.25em;
  height: 1.25em;
  margin: -0.125em 0;

  animation: ${spin} 1s linear infinite;
`;
