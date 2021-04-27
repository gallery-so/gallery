import styled from 'styled-components';
import colors from '../colors';

export const Title = styled.p`
  font-family: 'Times New Roman';
  margin: 0;

  font-size: 48px;
`;

type SubtitleProps = {
  color?: colors;
  // TODO: make these enums
  size?: 'normal' | 'large';
};

export const Subtitle = styled.p<SubtitleProps>`
  font-family: 'Helvetica Neue';
  margin: 0;

  font-weight: 500;
  font-size: ${({ size }) => (size === 'large' ? '28px' : '20px')};

  color: ${({ color }) => color ?? colors.black};
`;

type TextProps = {
  color?: colors;
  // TODO: make these enums
  lineHeight?: 'normal' | 'tight';
  // TODO: make these enums
  weight?: 'normal' | 'bold';
};

export const Text = styled.p<TextProps>`
  font-family: 'Helvetica Neue';
  margin: 0;

  font-size: 14px;
<<<<<<< HEAD
  line-height: 16px;
  color: ${({ light }) => (light ? colors.gray : colors.black)};
=======
  line-height: ${({ lineHeight }) =>
    lineHeight === 'tight' ? '16px' : '20px'};
  font-weight: ${({ weight }) => (weight === 'bold' ? 500 : 400)};
  color: ${({ color }) => color ?? colors.black};
>>>>>>> main
`;
