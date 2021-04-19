import styled from 'styled-components';
import colors from '../colors';

export const Title = styled.p`
  font-family: 'Times New Roman';
  margin: 0;

  font-size: 48px;
`;

type TextProps = {
  color?: colors;
};

export const Text = styled.p<TextProps>`
  font-family: 'Helvetica Neue';
  margin: 0;

  font-size: 14px;
  line-height: 16px;
  color: ${({ color }) => color ?? colors.black};
`;
