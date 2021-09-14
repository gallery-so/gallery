import styled, { keyframes } from 'styled-components';
import colors from '../colors';

type LoaderProps = {
  inverted?: boolean;
  thicc?: boolean;
  extraThicc?: boolean;
  size?: 'mini' | 'small' | 'medium' | 'large';
};

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Loader = styled.div<LoaderProps>`
  border: ${({ thicc, extraThicc }) => (extraThicc ? 4 : (thicc ? 3 : 2))}px solid
    ${({ inverted }) => (inverted ? colors.white : colors.black)};
  border-top: ${({ thicc, extraThicc }) => (extraThicc ? 4 : (thicc ? 3 : 2))}px
    solid ${({ inverted }) => (inverted ? colors.black : colors.white)};
  border-radius: 50%;

  ${({ size = 'small' }) => {
    switch (size) {
      case 'mini':
        return `
          width: 16px;
          height: 16px;
        `;
      case 'small':
        return `
          width: 20px;
          height: 20px;
        `;
      case 'medium':
        return `
          width: 24px;
          height: 24px;
        `;
      case 'large':
        return `
          width: 48px;
          height: 48px;
        `;
      default:
        return `
          width: 20px;
          height: 20px;
        `;
    }
  }}

  animation: ${spin} 1s linear infinite;
`;

export default Loader;
