import styled from 'styled-components';
import colors from '../colors';

type TitleProps = {
  // TODO: make these enums based on sizing chart in figma
  size?: 'normal' | 'mini';
};

export const Title = styled.p<TitleProps>`
  font-family: 'Gallery Display';
  margin: 0;

  font-size: ${({ size }) => (size === 'mini' ? '16px' : '48px')};
`;

type SubtitleProps = {
  color?: colors;
  // TODO: make these enums based on sizing chart in figma
  size?: 'normal' | 'large';
  // TODO: make these enums based on sizing chart in figma
  weight?: 'normal' | 'bold';
};

export const Subtitle = styled.p<SubtitleProps>`
  font-family: 'Helvetica Neue';
  margin: 0;

  font-weight: ${({ weight }) => (weight === 'bold' ? 500 : 400)};
  font-size: ${({ size }) => (size === 'large' ? '28px' : '20px')};

  color: ${({ color }) => color ?? colors.black};
`;

type TextProps = {
  color?: colors;
  // TODO: make these enums based on sizing chart in figma
  weight?: 'normal' | 'bold';
};

export const Text = styled.p<TextProps>`
  font-family: 'Helvetica Neue';
  margin: 0;

  font-size: 14px;
  // TODO: might wanna make this configurable with props
  line-height: 20px;

  font-weight: ${({ weight }) => (weight === 'bold' ? 500 : 400)};
  color: ${({ color }) => color ?? colors.black};
`;
