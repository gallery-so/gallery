import styled from 'styled-components';
import colors from '../colors';

export const Title = styled.p`
  font-family: 'Times New Roman';
  margin: 0;

  font-size: 48px;
`;

type TextProps = {
  light?: boolean;
};

export const Text = styled.p<TextProps>`
  font-family: 'Helvetica Neue';
  margin: 0;

  font-size: 12px;
  line-height: 16px;
  color: ${({ light }) => (light ? colors.gray : colors.black)};
`;
